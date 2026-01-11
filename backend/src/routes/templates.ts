import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { generateEmbedding } from '../lib/ai/embeddings.js';
import { authMiddleware } from '../middleware/auth.js';

export const templatesRouter = Router();

// --- GET ALL TEMPLATES ---
templatesRouter.get('/', async (req, res) => {
    try {
        const filter = req.query.filter as string;

        let query = supabase.from('templates').select('*');

        if (filter && filter !== 'all') {
            query = query.eq('domain', filter); // Filter by 'FLN', 'Career', 'Leadership'
        }

        const { data, error } = await query;

        if (error) {
            console.error('Fetch Templates Error:', error);
            return res.status(500).json({ error: 'Failed to fetch templates' });
        }

        res.json(data || []);

    } catch (error) {
        console.error('Get Templates Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- AI VECTOR SEARCH ---
templatesRouter.post('/search', async (req, res) => {
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
templatesRouter.post('/:id/fork', authMiddleware, async (req, res) => {
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

        // 2. Create New Project
        const { data: newProject, error: pError } = await supabaseClient
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
