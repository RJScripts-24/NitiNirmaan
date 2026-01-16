-- Add share_token and is_public_editing_enabled to projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS share_token uuid UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS is_public_editing_enabled boolean DEFAULT false;

-- Function to verify project token
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

-- Helper function to extract token from headers (for RLS)
CREATE OR REPLACE FUNCTION current_share_token()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('request.headers', true)::json->>'x-share-token';
$$;

-- Update RLS Policies for Projects
-- Allow SELECT if:
-- 1. User is owner (existing policy usually covers this, but ensuring here)
-- 2. Token in header matches share_token AND public editing is enabled
CREATE POLICY "Public view with share token"
ON projects
FOR SELECT
USING (
  auth.uid() = user_id -- Owner
  OR
  (
    is_public_editing_enabled = true
    AND
    share_token::text = current_share_token()
  )
);

-- Allow UPDATE if:
-- 1. User is owner
-- 2. Token in header matches ...
CREATE POLICY "Public edit with share token"
ON projects
FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  (
    is_public_editing_enabled = true
    AND
    share_token::text = current_share_token()
  )
);

-- Update RLS Policies for Nodes (and Edges)
-- We need to check the parent project's token.

-- NODES
CREATE POLICY "Public view nodes with share token"
ON nodes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = nodes.project_id
    AND (
      projects.user_id = auth.uid()
      OR
      (
        projects.is_public_editing_enabled = true
        AND
        projects.share_token::text = current_share_token()
      )
    )
  )
);

CREATE POLICY "Public insert nodes with share token"
ON nodes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = nodes.project_id
    AND (
      projects.user_id = auth.uid()
      OR
      (
        projects.is_public_editing_enabled = true
        AND
        projects.share_token::text = current_share_token()
      )
    )
  )
);

CREATE POLICY "Public update nodes with share token"
ON nodes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = nodes.project_id
    AND (
      projects.user_id = auth.uid()
      OR
      (
        projects.is_public_editing_enabled = true
        AND
        projects.share_token::text = current_share_token()
      )
    )
  )
);

CREATE POLICY "Public delete nodes with share token"
ON nodes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = nodes.project_id
    AND (
      projects.user_id = auth.uid()
      OR
      (
        projects.is_public_editing_enabled = true
        AND
        projects.share_token::text = current_share_token()
      )
    )
  )
);

-- EDGES (Assuming edges table exists and needs similar policies)
CREATE POLICY "Public view edges with share token"
ON edges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = edges.project_id
    AND (
      projects.user_id = auth.uid()
      OR
      (
        projects.is_public_editing_enabled = true
        AND
        projects.share_token::text = current_share_token()
      )
    )
  )
);

CREATE POLICY "Public insert edges with share token"
ON edges
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = edges.project_id
    AND (
      projects.user_id = auth.uid()
      OR
      (
        projects.is_public_editing_enabled = true
        AND
        projects.share_token::text = current_share_token()
      )
    )
  )
);

CREATE POLICY "Public update edges with share token"
ON edges
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = edges.project_id
    AND (
      projects.user_id = auth.uid()
      OR
      (
        projects.is_public_editing_enabled = true
        AND
        projects.share_token::text = current_share_token()
      )
    )
  )
);

CREATE POLICY "Public delete edges with share token"
ON edges
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = edges.project_id
    AND (
      projects.user_id = auth.uid()
      OR
      (
        projects.is_public_editing_enabled = true
        AND
        projects.share_token::text = current_share_token()
      )
    )
  )
);
