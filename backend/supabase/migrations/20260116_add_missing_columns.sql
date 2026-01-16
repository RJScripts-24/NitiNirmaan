-- Fix for missing columns in projects table
-- This adds 'location' and 'theme' if they are missing, ensuring the schema matches the backend code.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS theme text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS logic_health_score integer DEFAULT 0;

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists (to recreate cleanly)
DROP POLICY IF EXISTS "Users can create projects" ON projects;

-- Create policy for INSERT
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Force schema cache reload (usually happens automatically on DDL, but good to be sure)
NOTIFY pgrst, 'reload schema';
