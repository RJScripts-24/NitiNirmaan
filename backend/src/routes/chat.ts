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

        // Determine the system prompt based on user selection
        const { persona, graphData } = req.body;
        let systemPrompt = (persona === 'critical') ? PERSONAS.CRITIC : PERSONAS.MENTOR;

        // Inject Graph Context if available
        if (graphData && graphData.nodes && graphData.nodes.length > 0) {
            const contextString = `
            
CURRENT CANVAS CONTEXT:
Project: ${graphData.mission?.projectName || 'Untitled'}
Theme: ${graphData.mission?.domain || 'Unknown'}

NODES (The logic flow):
${graphData.nodes.map((n: any) => {
                // Format node data into a readable block
                const details = Object.entries(n.data)
                    .filter(([key]) => key !== 'label' && key !== 'type') // Exclude redundant keys
                    .map(([key, value]) => `  - ${key}: ${value}`)
                    .join('\n');

                return `[${n.type.toUpperCase()}] "${n.data.label}"\n${details}`;
            }).join('\n\n')}

EDGES:
${graphData.edges.length} connections.

User Question:
`;
            systemPrompt += contextString;
        }

        // Get the stream from our helper
        const responseStream = await streamChat(systemPrompt, messages);

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
