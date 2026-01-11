import { Router } from 'express';
import { streamChat } from '../lib/ai/groq.js';
import { PERSONAS } from '../lib/ai/prompts.js';

export const chatRouter = Router();

chatRouter.post('/', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Missing messages array' });
        }

        // Get the stream from our helper
        // We use the MENTOR persona for the chat widget
        const responseStream = await streamChat(PERSONAS.MENTOR, messages);

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Stream the response
        for await (const chunk of responseStream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(content);
            }
        }

        res.end();

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Internal AI Error' });
    }
});
