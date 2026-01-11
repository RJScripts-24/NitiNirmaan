import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { generateEmbedding } from '../lib/ai/embeddings.js';
import { authMiddleware } from '../middleware/auth.js';

export const ingestDocumentRouter = Router();

ingestDocumentRouter.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!content || !title) {
            return res.status(400).json({ error: 'Missing content' });
        }

        // 1. Generate Embedding using Hugging Face
        const vector = await generateEmbedding(content);

        // 2. Store in Supabase
        // Using type assertion because database types may not include all tables
        const { error } = await (supabase.from('knowledge_docs') as any).insert({
            title,
            content_chunk: content,
            embedding: vector,
            category: category || 'LFA_GUIDE',
        });

        if (error) {
            console.error('DB Insert Error', error);
            return res.status(500).json({ error: 'Failed to store document' });
        }

        res.status(200).json({ message: 'Document Ingested Successfully' });

    } catch (error) {
        console.error('Ingest API Error:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
});
