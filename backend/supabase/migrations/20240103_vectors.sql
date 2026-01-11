-- 6. TEMPLATES (Existing)
create table templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  domain text not null,
  difficulty text default 'Beginner', 
  context_tags text[], 
  embedding vector(1536), 
  author_org text,
  fork_count integer default 0,
  success_rating text default 'High',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Template Nodes (Existing)
create table template_nodes (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references templates(id) on delete cascade not null,
  type text not null,
  label text not null,
  position_x numeric not null,
  position_y numeric not null,
  data jsonb default '{}'::jsonb
);

-- Template Edges (Existing)
create table template_edges (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references templates(id) on delete cascade not null,
  source_node_id uuid references template_nodes(id) on delete cascade not null,
  target_node_id uuid references template_nodes(id) on delete cascade not null,
  interaction_type text,
  indicators jsonb default '[]'::jsonb
);

-- 8. KNOWLEDGE BASE (Contextual RAG) - NEW
-- Stores chunks of the "Common LFA" PDF or other reference docs
create table knowledge_docs (
  id uuid default gen_random_uuid() primary key,
  title text not null, -- e.g. "Common LFA Standard v1.pdf"
  content_chunk text not null, -- The actual text context
  embedding vector(1536), -- Vector for similarity search
  category text default 'LFA_GUIDE', -- 'LFA_GUIDE', 'CASE_STUDY'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table templates enable row level security;
alter table template_nodes enable row level security;
alter table template_edges enable row level security;
alter table knowledge_docs enable row level security;

create policy "Templates are viewable by everyone" on templates for select using (true);
create policy "Template nodes are viewable by everyone" on template_nodes for select using (true);
create policy "Template edges are viewable by everyone" on template_edges for select using (true);
create policy "Knowledge docs are viewable by everyone" on knowledge_docs for select using (true);

-- 7. VECTOR SEARCH FUNCTIONS
create or replace function match_templates (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  description text,
  domain text,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      templates.id,
      templates.title,
      templates.description,
      templates.domain,
      1 - (templates.embedding <=> query_embedding) as similarity
    from templates
    where 1 - (templates.embedding <=> query_embedding) > match_threshold
    order by templates.embedding <=> query_embedding
    limit match_count;
end;
$$;

create or replace function match_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  content_chunk text,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      knowledge_docs.id,
      knowledge_docs.title,
      knowledge_docs.content_chunk,
      1 - (knowledge_docs.embedding <=> query_embedding) as similarity
    from knowledge_docs
    where 1 - (knowledge_docs.embedding <=> query_embedding) > match_threshold
    order by knowledge_docs.embedding <=> query_embedding
    limit match_count;
end;
$$;
