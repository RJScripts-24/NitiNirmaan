-- Add missing columns to edges table for styling persistence
ALTER TABLE edges ADD COLUMN IF NOT EXISTS source_handle text;
ALTER TABLE edges ADD COLUMN IF NOT EXISTS target_handle text;
ALTER TABLE edges ADD COLUMN IF NOT EXISTS type text DEFAULT 'default';
ALTER TABLE edges ADD COLUMN IF NOT EXISTS animated boolean DEFAULT false;
ALTER TABLE edges ADD COLUMN IF NOT EXISTS style jsonb DEFAULT '{}'::jsonb;
ALTER TABLE edges ADD COLUMN IF NOT EXISTS marker_end jsonb;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
