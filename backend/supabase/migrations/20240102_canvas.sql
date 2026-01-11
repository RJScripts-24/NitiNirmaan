-- 3. NODES (The Building Blocks)
create table nodes (
  id text not null, -- ReactFlow uses string IDs (e.g., 'node-1')
  project_id uuid references projects(id) on delete cascade not null,
  type text not null, -- 'stakeholder', 'intervention', 'outcome'
  label text not null,
  position_x numeric not null,
  position_y numeric not null,
  data jsonb default '{}'::jsonb, -- Stores flexible data (cost, bandwidth, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, project_id) -- Composite key to allow same ID 'node-1' in different projects
);

-- Enable RLS for Nodes
alter table nodes enable row level security;

create policy "Users can view nodes of their projects"
  on nodes for select
  using ( exists ( select 1 from projects where id = nodes.project_id and user_id = auth.uid() ) );

create policy "Users can insert nodes to their projects"
  on nodes for insert
  with check ( exists ( select 1 from projects where id = nodes.project_id and user_id = auth.uid() ) );

create policy "Users can update nodes of their projects"
  on nodes for update
  using ( exists ( select 1 from projects where id = nodes.project_id and user_id = auth.uid() ) );

create policy "Users can delete nodes of their projects"
  on nodes for delete
  using ( exists ( select 1 from projects where id = nodes.project_id and user_id = auth.uid() ) );


-- 4. EDGES (The Logic Connections)
create table edges (
  id text not null,
  project_id uuid references projects(id) on delete cascade not null,
  source_node_id text not null,
  target_node_id text not null,
  interaction_type text, -- 'reports_to', 'services', 'causes'
  indicators jsonb default '[]'::jsonb, -- Array of strings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, project_id)
);

-- Enable RLS for Edges
alter table edges enable row level security;

create policy "Users can view edges of their projects"
  on edges for select
  using ( exists ( select 1 from projects where id = edges.project_id and user_id = auth.uid() ) );

create policy "Users can insert edges to their projects"
  on edges for insert
  with check ( exists ( select 1 from projects where id = edges.project_id and user_id = auth.uid() ) );

create policy "Users can update edges of their projects"
  on edges for update
  using ( exists ( select 1 from projects where id = edges.project_id and user_id = auth.uid() ) );

create policy "Users can delete edges of their projects"
  on edges for delete
  using ( exists ( select 1 from projects where id = edges.project_id and user_id = auth.uid() ) );
