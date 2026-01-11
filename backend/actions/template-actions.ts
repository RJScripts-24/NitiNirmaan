'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/database.types';
import OpenAI from 'openai';

// Initialize OpenAI for Vector Embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: Supabase Client
const createClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { try { cookieStore.set({ name, value, ...options }); } catch (e) {} },
        remove(name: string, options: CookieOptions) { try { cookieStore.set({ name, value: '', ...options }); } catch (e) {} },
      },
    }
  );
};

// --- ACTION 1: FETCH ALL TEMPLATES (For the Library Page) ---
export async function getTemplates(filter?: string) {
  const supabase = createClient();
  
  let query = supabase.from('templates').select('*');
  
  if (filter && filter !== 'all') {
    query = query.eq('domain', filter); // Filter by 'FLN', 'Career', 'Leadership'
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Fetch Templates Error:', error);
    return [];
  }
  
  return data;
}

// --- ACTION 2: AI VECTOR SEARCH (For the Wizard Page) ---
export async function findMatchingTemplates(userGoal: string) {
  const supabase = createClient();

  try {
    // 1. Generate Embedding for the User's Goal
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userGoal,
    });
    
    const vector = embeddingResponse.data[0].embedding;

    // 2. Query Supabase using pgvector (RPC call to match_templates function)
    const { data: templates, error } = await supabase.rpc('match_templates', {
      query_embedding: vector,
      match_threshold: 0.7, // Only return relevant matches
      match_count: 3,
    });

    if (error) throw error;
    
    return templates;

  } catch (err) {
    console.error('Vector Search Error:', err);
    // Fallback: Return top 3 generic templates if AI fails
    return getTemplates().then(t => t.slice(0, 3));
  }
}

// --- ACTION 3: FORK TEMPLATE (The "Clone" Logic) ---
export async function forkTemplate(templateId: string, projectTitle: string) {
  const supabase = createClient();
  
  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 2. Fetch Template Data
  const { data: template, error: tError } = await supabase
    .from('templates')
    .select('*, template_nodes(*), template_edges(*)')
    .eq('id', templateId)
    .single();

  if (tError || !template) return { error: 'Template not found' };

  // 3. Create New Project
  const { data: newProject, error: pError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: projectTitle || `Copy of ${template.title}`,
      description: `Forked from ${template.title} model.`,
      status: 'draft',
      logic_health_score: 80, // Starts high because it's a proven model
      theme: template.domain,
    })
    .select('id')
    .single();

  if (pError) return { error: 'Failed to create project' };

  // 4. Clone Nodes
  const nodesToInsert = template.template_nodes.map(node => ({
    project_id: newProject.id,
    type: node.type,
    label: node.label,
    position_x: node.position_x,
    position_y: node.position_y,
    data: node.data, // Preserves specific FLN/Career content
  }));

  const { data: insertedNodes, error: nError } = await supabase
    .from('nodes')
    .insert(nodesToInsert)
    .select('id, data'); // Need new IDs to map edges

  if (nError) return { error: 'Failed to clone nodes' };

  // 5. Clone Edges (Map Old Node IDs to New Node IDs)
  // Logic: We need to match the old template node ID to the new project node ID.
  // Assumption: The order of insertion is preserved or we map by label/data.
  // For Hackathon simplicity, we map by Label (assuming unique labels in template).
  
  const nodeMap = new Map(); // Key: Label, Value: New Node ID
  insertedNodes.forEach(n => nodeMap.set(n.data['label'], n.id));

  const edgesToInsert = template.template_edges.map(edge => {
    // Find the source and target in the new node set
    // Note: In production, use a temporary ID map, but Label works for simple graphs
    const sourceLabel = template.template_nodes.find(n => n.id === edge.source_node_id)?.label;
    const targetLabel = template.template_nodes.find(n => n.id === edge.target_node_id)?.label;

    return {
      project_id: newProject.id,
      source_node_id: nodeMap.get(sourceLabel),
      target_node_id: nodeMap.get(targetLabel),
      interaction_type: edge.interaction_type,
      indicators: edge.indicators,
    };
  }).filter(e => e.source_node_id && e.target_node_id); // Filter broken links

  if (edgesToInsert.length > 0) {
    const { error: eError } = await supabase.from('edges').insert(edgesToInsert);
    if (eError) console.error('Edge Clone Error', eError);
  }

  // 6. Redirect to the Builder
  redirect(`/builder/${newProject.id}`);
}