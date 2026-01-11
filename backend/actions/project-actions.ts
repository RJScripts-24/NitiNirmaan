// Save/Load Graph State actions
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Database } from '@/types/database.types';

// Helper to create Supabase Client
const createClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (e) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (e) {}
        },
      },
    }
  );
};

// --- ACTION: CREATE NEW PROJECT (MISSION SETUP) ---
export async function createProject(formData: FormData) {
  const supabase = createClient();
  
  // 1. Get User
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Unauthorized' };

  // 2. Extract Data from Wizard
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const theme = formData.get('theme') as string; // 'FLN', 'Career', 'STEM'
  const location = formData.get('location') as string;

  // 3. Insert into Projects Table
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: title,
      description: description,
      theme: theme,
      location: location,
      status: 'draft',
      logic_health_score: 0, // Starts at 0
    })
    .select('id')
    .single();

  if (error) {
    console.error('Create Project Error:', error);
    return { error: 'Failed to create mission.' };
  }

  // 4. Redirect to the Builder Canvas
  revalidatePath('/dashboard');
  redirect(`/builder/${data.id}`);
}

// --- ACTION: SAVE GRAPH STATE (THE "SAVE GAME" BUTTON) ---
export async function saveProjectGraph(
  projectId: string, 
  nodes: any[], 
  edges: any[],
  logicScore: number
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 1. Update Project Metadata (Last edited & Logic Score)
  const { error: projError } = await supabase
    .from('projects')
    .update({
      logic_health_score: logicScore,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (projError) return { error: 'Failed to update project metadata' };

  // 2. Sync Nodes (Upsert Strategy)
  // We format the ReactFlow nodes to match our DB Schema
  const formattedNodes = nodes.map((node) => ({
    id: node.id,
    project_id: projectId,
    type: node.type,
    label: node.data.label,
    position_x: node.position.x,
    position_y: node.position.y,
    // Store extra game data (bandwidth, cost) in a JSONB column
    data: node.data, 
  }));

  // Delete old nodes to handle removals (Simpler for Hackathon than diffing)
  // Note: specific RLS policies might be needed to allow deleting your own nodes
  await supabase.from('nodes').delete().eq('project_id', projectId);
  const { error: nodeError } = await supabase.from('nodes').insert(formattedNodes);

  if (nodeError) {
    console.error('Node Save Error:', nodeError);
    return { error: 'Failed to save system nodes.' };
  }

  // 3. Sync Edges
  const formattedEdges = edges.map((edge) => ({
    id: edge.id,
    project_id: projectId,
    source_node_id: edge.source,
    target_node_id: edge.target,
    interaction_type: edge.data?.interactionType || 'connects',
    indicators: edge.data?.indicators || [], // Store indicators in JSONB
  }));

  await supabase.from('edges').delete().eq('project_id', projectId);
  const { error: edgeError } = await supabase.from('edges').insert(formattedEdges);

  if (edgeError) {
    console.error('Edge Save Error:', edgeError);
    return { error: 'Failed to save logic connections.' };
  }

  revalidatePath(`/builder/${projectId}`);
  return { success: 'System blueprint saved successfully.' };
}

// --- ACTION: DELETE PROJECT ---
export async function deleteProject(projectId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) return { error: 'Failed to delete project' };

  revalidatePath('/dashboard');
  return { success: 'Project deleted' };
}

// --- ACTION: FETCH PROJECT (LOAD GAME) ---
export async function getProjectData(projectId: string) {
  const supabase = createClient();
  
  // Fetch Project Metadata
  const { data: project, error: projError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projError) return { error: 'Project not found' };

  // Fetch Nodes
  const { data: nodes, error: nodeError } = await supabase
    .from('nodes')
    .select('*')
    .eq('project_id', projectId);

  // Fetch Edges
  const { data: edges, error: edgeError } = await supabase
    .from('edges')
    .select('*')
    .eq('project_id', projectId);

  if (nodeError || edgeError) return { error: 'Failed to load system architecture' };

  // Reconstruct ReactFlow format
  const flowNodes = nodes.map(n => ({
    id: n.id,
    type: n.type,
    position: { x: n.position_x, y: n.position_y },
    data: { ...n.data, label: n.label }
  }));

  const flowEdges = edges.map(e => ({
    id: e.id,
    source: e.source_node_id,
    target: e.target_node_id,
    data: { 
      interactionType: e.interaction_type,
      indicators: e.indicators
    }
  }));

  return { project, nodes: flowNodes, edges: flowEdges };
}