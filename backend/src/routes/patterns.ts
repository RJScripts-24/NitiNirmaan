import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { generateEmbedding } from '../lib/ai/embeddings.js';
import { authMiddleware } from '../middleware/auth.js';

export const patternsRouter = Router();

// --- GET ALL TEMPLATES ---
patternsRouter.get('/', async (req: any, res: any) => {
    try {
        const filter = req.query.filter as string;

        let query = supabase.from('templates').select('*');

        if (filter && filter !== 'all') {
            query = query.eq('theme', filter);
        }

        const geography = req.query.geography as string;
        if (geography) {
            query = query.contains('geography', [geography]);
        }

        const scale = req.query.scale as string;
        if (scale) {
            query = query.contains('scale', [scale]);
        }

        const { data, error } = await query;
        const templates = data as any[] || [];

        if (error) {
            console.error('Fetch Patterns Error:', error);
            return res.status(500).json({ error: 'Failed to fetch patterns' });
        }

        // Map to OpenAPI Pattern schema
        const patterns = templates.map(p => ({
            id: p.id,
            title: p.title,
            institution: p.institution || 'NitiNirmaan',
            forkedCount: p.forked_count || 0,
            successRate: 'High', // Mocked based on logic_health_score or random
            theme: Array.isArray(p.theme) ? p.theme : [p.theme],
            geography: p.geography || [],
            scale: p.scale || [],
            nodes: p.nodes || [],
            connections: p.edges || [], // mapping edges to connections
            metadata: {
                geography: p.metadata?.geography,
                operatingScale: p.metadata?.operatingScale,
                stakeholders: p.metadata?.stakeholders || [],
                constraints: p.metadata?.constraints || []
            }
        }));

        res.json(patterns);

    } catch (error) {
        console.error('Get Templates Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- AI VECTOR SEARCH ---
patternsRouter.post('/search', async (req, res) => {
    try {
        const { userGoal } = req.body;

        if (!userGoal) {
            return res.status(400).json({ error: 'userGoal is required' });
        }

        // 1. Generate Embedding for the User's Goal (via Hugging Face)
        const vector = await generateEmbedding(userGoal);

        // 2. Query Supabase using pgvector (RPC call to match_templates function)
        // Using type assertion because RPC function types may not match exactly
        const { data: templates, error } = await (supabase.rpc as any)('match_templates', {
            query_embedding: vector,
            match_threshold: 0.7,
            match_count: 3,
        });

        if (error) {
            console.error('Vector Search Error:', error);
            // Fallback: Return top 3 generic templates if AI fails
            const { data: fallbackData } = await supabase.from('templates').select('*').limit(3);
            return res.json(fallbackData || []);
        }

        res.json(templates || []);

    } catch (error) {
        console.error('Search Templates Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- FORK TEMPLATE ---
patternsRouter.post('/:id/fork', authMiddleware, async (req: any, res: any) => {
    try {
        const supabaseClient = req.supabaseClient!;
        const user = req.user!;
        const templateId = req.params.id;
        const { projectTitle } = req.body;

        // 1. Fetch Template Data
        const { data: template, error: tError } = await supabase
            .from('templates')
            .select('*')
            .eq('id', templateId)
            .single();

        if (tError || !template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        const templateData = template as any;

        // 2. Create New Project
        const { data: newProject, error: pError } = await supabaseClient
            .from('projects')
            .insert({
                user_id: user.id,
                title: projectTitle || `Copy of ${templateData.title}`,
                description: `Forked from ${templateData.title} model.`,
                status: 'draft',
                logic_health_score: 80, // Starts high because it's a proven model
                theme: templateData.domain,
            })
            .select('id')
            .single();

        if (pError) {
            return res.status(500).json({ error: 'Failed to create project' });
        }

        // Note: In production, you would also clone template_nodes and template_edges
        // This simplified version just creates the project

        res.status(201).json({
            id: newProject.id,
            message: 'Template forked successfully'
        });

    } catch (error) {
        console.error('Fork Template Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
