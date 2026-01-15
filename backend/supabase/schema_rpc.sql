-- [Previous content of schema.sql is assumed to be here or we append to it]
-- We will append the fork_project RPC and then the seed data in a separate file or step.
-- Ideally, we edit schema.sql to add the RPC, and seeds_patterns.sql to add the nodes.

-- 9. FORK PROJECT RPC
create or replace function fork_project(
  p_template_id uuid,
  p_owner_id uuid
)
returns uuid
language plpgsql
as $$
declare
  v_new_project_id uuid;
begin
  -- 1. Copy Project
  insert into public.projects (
    owner_id,
    title,
    description,
    primary_domain,
    operating_scale,
    geography,
    intervention_levers,
    metadata,
    is_template,
    simulation_status,
    embedding
  )
  select
    p_owner_id,
    title || ' (Copy)', -- Append (Copy) to title
    description,
    primary_domain,
    operating_scale,
    geography,
    intervention_levers,
    metadata,
    false, -- New project is NOT a template
    'draft', -- Reset status
    embedding
  from public.projects
  where id = p_template_id
  returning id into v_new_project_id;

  -- 2. Copy Nodes
  insert into public.nodes (id, project_id, type, position, data)
  select
    id, -- Keep original text IDs for React Flow consistency within the graph
    v_new_project_id,
    type,
    position,
    data
  from public.nodes
  where project_id = p_template_id;

  -- 3. Copy Edges
  insert into public.edges (id, project_id, source, target, label)
  select
    id,
    v_new_project_id,
    source,
    target,
    label
  from public.edges
  where project_id = p_template_id;

  return v_new_project_id;
end;
$$;
