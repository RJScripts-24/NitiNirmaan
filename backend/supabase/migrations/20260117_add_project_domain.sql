-- Add domain and other mission fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS domain text DEFAULT 'FLN';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS outcome text;

-- Add comment explaining the domain column
COMMENT ON COLUMN projects.domain IS 'The domain/mode of the project: FLN or Career Readiness';
