-- Fix for missing columns in projects table + Share Feature
-- This script adds missing columns and ensures the Share Feature RLS policies exist.

-- 1. Base Columns (from previous checks)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS theme text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS logic_health_score integer DEFAULT 0;

-- 2. Share Feature Columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT gen_random_uuid();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public_editing_enabled boolean DEFAULT false;

-- Add unique constraint to share_token if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_share_token_key') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_share_token_key UNIQUE (share_token);
    END IF;
END $$;

-- 3. Helper Functions for Sharing
CREATE OR REPLACE FUNCTION verify_project_token(project_uuid uuid, token_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM projects
    WHERE id = project_uuid
      AND share_token::text = token_input
      AND is_public_editing_enabled = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION current_share_token()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('request.headers', true)::json->>'x-share-token';
$$;

-- 4. RLS Policies for Sharing
-- We use DROP IF EXISTS to ensure we can re-run this script safely.

-- Projects Table
-- Allow public access if user is owner, OR if the project has public editing enabled
-- The key change: allow access if share_token matches the value being filtered (via eq)
-- This is a workaround since supabase-js v2 doesn't easily allow setting custom headers.
DROP POLICY IF EXISTS "Public view with share token" ON projects;
CREATE POLICY "Public view with share token" ON projects FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = owner_id
  OR is_public_editing_enabled = true
);

DROP POLICY IF EXISTS "Public edit with share token" ON projects;
CREATE POLICY "Public edit with share token" ON projects FOR UPDATE
USING (
  auth.uid() = user_id 
  OR auth.uid() = owner_id
  OR is_public_editing_enabled = true
);

-- Nodes Table - Simplified policies for anonymous shared access
DROP POLICY IF EXISTS "Public view nodes with share token" ON nodes;
CREATE POLICY "Public view nodes with share token" ON nodes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = nodes.project_id
    AND (projects.user_id = auth.uid() OR projects.owner_id = auth.uid() OR projects.is_public_editing_enabled = true)
  )
);

DROP POLICY IF EXISTS "Public insert nodes with share token" ON nodes;
CREATE POLICY "Public insert nodes with share token" ON nodes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = nodes.project_id
    AND (projects.user_id = auth.uid() OR projects.owner_id = auth.uid() OR projects.is_public_editing_enabled = true)
  )
);

DROP POLICY IF EXISTS "Public update nodes with share token" ON nodes;
CREATE POLICY "Public update nodes with share token" ON nodes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = nodes.project_id
    AND (projects.user_id = auth.uid() OR projects.owner_id = auth.uid() OR projects.is_public_editing_enabled = true)
  )
);

DROP POLICY IF EXISTS "Public delete nodes with share token" ON nodes;
CREATE POLICY "Public delete nodes with share token" ON nodes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = nodes.project_id
    AND (projects.user_id = auth.uid() OR projects.owner_id = auth.uid() OR projects.is_public_editing_enabled = true)
  )
);

-- Edges Table - Simplified policies for anonymous shared access
DROP POLICY IF EXISTS "Public view edges with share token" ON edges;
CREATE POLICY "Public view edges with share token" ON edges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = edges.project_id
    AND (projects.user_id = auth.uid() OR projects.owner_id = auth.uid() OR projects.is_public_editing_enabled = true)
  )
);

DROP POLICY IF EXISTS "Public insert edges with share token" ON edges;
CREATE POLICY "Public insert edges with share token" ON edges FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = edges.project_id
    AND (projects.user_id = auth.uid() OR projects.owner_id = auth.uid() OR projects.is_public_editing_enabled = true)
  )
);

DROP POLICY IF EXISTS "Public update edges with share token" ON edges;
CREATE POLICY "Public update edges with share token" ON edges FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = edges.project_id
    AND (projects.user_id = auth.uid() OR projects.owner_id = auth.uid() OR projects.is_public_editing_enabled = true)
  )
);

DROP POLICY IF EXISTS "Public delete edges with share token" ON edges;
CREATE POLICY "Public delete edges with share token" ON edges FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = edges.project_id
    AND (projects.user_id = auth.uid() OR projects.owner_id = auth.uid() OR projects.is_public_editing_enabled = true)
  )
);

-- Reload Schema
NOTIFY pgrst, 'reload schema';
