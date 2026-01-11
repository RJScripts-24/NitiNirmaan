import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const projectsRouter = Router();

// --- CREATE NEW PROJECT ---
projectsRouter.post('/', authMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const user = req.user!;

        const { title, description, theme, location } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Insert into Projects Table
        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                title: title,
                description: description || null,
                theme: theme || 'GENERAL',
                location: location || null,
                status: 'draft',
                logic_health_score: 0, // Starts at 0
            })
            .select('id')
            .single();

        if (error) {
            console.error('Create Project Error:', error);
            return res.status(500).json({ error: 'Failed to create mission.' });
        }

        res.status(201).json({ id: data.id, message: 'Project created successfully' });

    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- GET PROJECT DATA ---
projectsRouter.get('/:id', authMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const projectId = req.params.id;

        // Fetch Project Metadata
        const { data: project, error: projError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projError) {
            return res.status(404).json({ error: 'Project not found' });
        }

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

        if (nodeError || edgeError) {
            return res.status(500).json({ error: 'Failed to load system architecture' });
        }

        // Reconstruct ReactFlow format
        const flowNodes = (nodes || []).map(n => ({
            id: n.id,
            type: n.type,
            position: { x: n.position_x, y: n.position_y },
            data: { ...(n.data as object || {}), label: n.label }
        }));

        const flowEdges = (edges || []).map(e => ({
            id: e.id,
            source: e.source_node_id,
            target: e.target_node_id,
            data: {
                interactionType: e.interaction_type,
                indicators: e.indicators
            }
        }));

        res.json({ project, nodes: flowNodes, edges: flowEdges });

    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- SAVE PROJECT GRAPH ---
projectsRouter.put('/:id/graph', authMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const projectId = req.params.id;
        const { nodes, edges, logicScore } = req.body;

        if (!nodes || !edges) {
            return res.status(400).json({ error: 'Missing nodes or edges' });
        }

        // 1. Update Project Metadata (Last edited & Logic Score)
        const { error: projError } = await supabase
            .from('projects')
            .update({
                logic_health_score: logicScore || 0,
                updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);

        if (projError) {
            return res.status(500).json({ error: 'Failed to update project metadata' });
        }

        // 2. Sync Nodes (Upsert Strategy)
        const formattedNodes = nodes.map((node: any) => ({
            id: node.id,
            project_id: projectId,
            type: node.type,
            label: node.data.label,
            position_x: node.position.x,
            position_y: node.position.y,
            data: node.data,
        }));

        // Delete old nodes to handle removals
        await supabase.from('nodes').delete().eq('project_id', projectId);
        const { error: nodeError } = await supabase.from('nodes').insert(formattedNodes);

        if (nodeError) {
            console.error('Node Save Error:', nodeError);
            return res.status(500).json({ error: 'Failed to save system nodes.' });
        }

        // 3. Sync Edges
        const formattedEdges = edges.map((edge: any) => ({
            id: edge.id,
            project_id: projectId,
            source_node_id: edge.source,
            target_node_id: edge.target,
            interaction_type: edge.data?.interactionType || 'connects',
            indicators: edge.data?.indicators || [],
        }));

        await supabase.from('edges').delete().eq('project_id', projectId);
        const { error: edgeError } = await supabase.from('edges').insert(formattedEdges);

        if (edgeError) {
            console.error('Edge Save Error:', edgeError);
            return res.status(500).json({ error: 'Failed to save logic connections.' });
        }

        res.json({ message: 'System blueprint saved successfully.' });

    } catch (error) {
        console.error('Save Project Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- DELETE PROJECT ---
projectsRouter.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const projectId = req.params.id;

        const { error } = await supabase.from('projects').delete().eq('id', projectId);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete project' });
        }

        res.json({ message: 'Project deleted' });

    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- GET USER'S PROJECTS ---
projectsRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const user = req.user!;

        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch projects' });
        }

        res.json(projects || []);

    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
