-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- 1. USERS (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  organization_name text,
  -- Tracks gamification progress (e.g., ['teacher', 'student', 'BEO'])
  unlocked_stakeholders jsonb default '["teacher", "student"]'::jsonb,
  avatar_url text
);

-- 2. PROJECTS (The LFA Documents & Templates)
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references public.profiles(id) not null,
  
  -- Core Identity
  title text not null,
  description text, -- Can store the "Problem Statement" or summary
  
  -- Metadata for Filters & Context (Matches Frontend 'MissionInitialize' & 'PatternLibrary')
  primary_domain text,    -- e.g., 'FLN', 'Career Readiness', 'STEM'
  operating_scale text,   -- e.g., 'School', 'Cluster', 'Block', 'District', 'State'
  geography text,         -- e.g., 'Rural', 'Urban', 'Tribal', 'Mixed'
  intervention_levers text[], -- Array of strings: ['Pedagogy', 'Governance', 'EdTech']
  institution text,       -- e.g., 'Pratham', 'Quest Alliance' (for templates)
  
  -- Extended Metadata (JSONB for flexibility)
  -- Stores: { "location_state": "Bihar", "location_district": "Gaya", "core_outcome": "...", "ai_companion_mode": "critical", "success_rate": "High" }
  metadata jsonb default '{}'::jsonb,

  -- If true, this project appears in the "Forkable Patterns" library
  is_template boolean default false, 
  
  -- Stores the final simulation score or status
  simulation_status text default 'draft' check (simulation_status in ('draft', 'failed', 'verified')),
  
  -- Embedding for semantic search (for "Find similar patterns")
  embedding vector(1536)
);

-- 3. NODES (The Visual Elements on Canvas)
create table public.nodes (
  id text not null, -- React Flow uses string IDs
  project_id uuid references public.projects(id) on delete cascade not null,
  type text not null, -- 'entity', 'intervention', 'outcome', 'indicator'
  -- JSONB is perfect for storing UI state like { "x": 100, "y": 200 }
  position jsonb not null, 
  -- Stores the actual text content: { "label": "Teacher Training", "metrics": "..." }
  data jsonb not null, 
  primary key (id, project_id)
);

-- 4. EDGES (The Logic Links)
create table public.edges (
  id text not null, -- React Flow uses string IDs
  project_id uuid references public.projects(id) on delete cascade not null,
  source text not null,
  target text not null,
  -- The label describing the relationship (e.g., "mentors", "produces")
  label text, 
  primary key (id, project_id)
);

-- 5. KNOWLEDGE BASE (For RAG / Devil's Advocate)
-- This stores chunks of the Common LFA PDF and proven model documents
create table public.knowledge_base (
  id bigserial primary key,
  content text, -- The text chunk (e.g., "One-off training failure rates...")
  metadata jsonb, -- Source: "World Bank Report 2024"
  embedding vector(1536) -- OpenAI embedding dimension
);

-- 6. PATTERN SEARCH FUNCTION
-- Matches patterns based on embedding similarity AND allows valid filtering
create or replace function match_patterns (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_domain text default null,
  filter_scale text default null
)
returns table (
  id uuid,
  title text,
  description text,
  primary_domain text,
  operating_scale text,
  geography text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    projects.id,
    projects.title,
    projects.description,
    projects.primary_domain,
    projects.operating_scale,
    projects.geography,
    1 - (projects.embedding <=> query_embedding) as similarity
  from projects
  where 
    projects.is_template = true 
    and 1 - (projects.embedding <=> query_embedding) > match_threshold
    -- Optional filters (if parameter is null, ignore the filter)
    and (filter_domain is null or projects.primary_domain = filter_domain)
    and (filter_scale is null or projects.operating_scale = filter_scale)
  order by similarity desc
  limit match_count;
end;
$$;

-- 7. REALTIME & TRIGGERS
alter publication supabase_realtime add table nodes, edges;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. MASTER DATA (States & Districts)
create table public.master_states (
  id text primary key, -- ISO code or Short Code (e.g. 'BR', 'GJ')
  name text not null
);

create table public.master_districts (
  id serial primary key,
  state_id text references public.master_states(id) not null,
  name text not null
);

-- Seed Data for States
insert into public.master_states (id, name) values
('BR', 'Bihar'),
('GJ', 'Gujarat'),
('PB', 'Punjab'),
('RJ', 'Rajasthan'),
('HP', 'Himachal Pradesh'),
('UP', 'Uttar Pradesh'),
('MH', 'Maharashtra'),
('KA', 'Karnataka'),
('TN', 'Tamil Nadu'),
('DL', 'Delhi');

-- Seed Data for Districts (Sample)
insert into public.master_districts (state_id, name) values
-- Bihar
('BR', 'Patna'), ('BR', 'Gaya'), ('BR', 'Muzaffarpur'), ('BR', 'Bhagalpur'), ('BR', 'Darbhanga'),
-- Gujarat
('GJ', 'Ahmedabad'), ('GJ', 'Surat'), ('GJ', 'Vadodara'), ('GJ', 'Rajkot'), ('GJ', 'Gandhinagar'),
-- Punjab
('PB', 'Ludhiana'), ('PB', 'Amritsar'), ('PB', 'Jalandhar'), ('PB', 'Patiala'),
-- Rajasthan
('RJ', 'Jaipur'), ('RJ', 'Udaipur'), ('RJ', 'Jodhpur'), ('RJ', 'Kota'),
-- Himachal
('HP', 'Shimla'), ('HP', 'Manali'), ('HP', 'Dharamshala'),
-- Uttar Pradesh
('UP', 'Lucknow'), ('UP', 'Kanpur'), ('UP', 'Varanasi'), ('UP', 'Noida'),
-- Maharashtra
('MH', 'Mumbai'), ('MH', 'Pune'), ('MH', 'Nagpur'), ('MH', 'Nashik'),
-- Karnataka
('KA', 'Bengaluru'), ('KA', 'Mysuru'), ('KA', 'Hubballi'),
-- Tamil Nadu
('TN', 'Chennai'), ('TN', 'Coimbatore'), ('TN', 'Madurai'),
-- Delhi
('DL', 'New Delhi'), ('DL', 'North Delhi'), ('DL', 'South Delhi');

-- Enable RLS but allow public read for master data
alter table public.master_states enable row level security;
alter table public.master_districts enable row level security;

create policy "Allow public read access to states" on public.master_states
  for select using (true);
  
create policy "Allow public read access to districts" on public.master_districts
  for select using (true);
