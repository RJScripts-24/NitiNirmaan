-- 8. ENABLE REALTIME REPLICATION
-- This allows Supabase client to listen for changes on these tables
alter publication supabase_realtime add table nodes;
alter publication supabase_realtime add table edges;
alter publication supabase_realtime add table project_members;
