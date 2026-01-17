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
        if (graphData) {
            // Extract Problem Statement from canvas nodes if available
            const problemNode = graphData.nodes?.find((n: any) =>
                n.type === 'problem' || n.type === 'problemStatement' ||
                n.data?.type === 'problem' || n.data?.type === 'problemStatement' ||
                n.id?.includes('learning_crisis') || n.id?.includes('neet')
            );
            const problemStatement = problemNode?.data?.label || problemNode?.data?.description || 'Needs to be added to canvas';

            const contextString = `
            
CURRENT PROJECT CONTEXT:
- Project Name: ${graphData.mission?.projectName || 'Untitled'}
- Domain: ${graphData.mission?.domain || 'Unknown'}
- Location: ${graphData.mission?.district ? `${graphData.mission.district}, ${graphData.mission.state}` : 'Not specified'}

USER'S STATED MISSION OUTCOME: 
"${graphData.mission?.outcome || 'Not yet defined'}"

PROBLEM STATEMENT ON CANVAS: 
"${problemStatement}"

---
LOGIC TOOLBOX (You MUST only suggest nodes from this list):

${graphData.toolbox ? (() => {
                    // Group toolbox items by category
                    const categories: Record<string, any[]> = {};
                    graphData.toolbox.forEach((t: any) => {
                        if (!categories[t.category]) categories[t.category] = [];
                        categories[t.category].push(t);
                    });
                    return Object.entries(categories).map(([cat, items]) =>
                        `## ${cat.toUpperCase()}:\n${items.map((t: any) => `  - ${t.id}: "${t.label}"`).join('\n')}`
                    ).join('\n\n');
                })() : 'Standard Toolbox'}
---

NODES CURRENTLY ON CANVAS:
${graphData.nodes && graphData.nodes.length > 0 ? graphData.nodes.map((n: any) => {
                    const details = Object.entries(n.data)
                        .filter(([key]) => key !== 'label' && key !== 'type')
                        .map(([key, value]) => `  - ${key}: ${value}`)
                        .join('\n');
                    return `- [${n.data.type || n.type}] "${n.data.label}"${details ? '\n' + details : ''}`;
                }).join('\n') : '(Canvas is currently empty)'}

EDGES: ${graphData.edges ? graphData.edges.length : 0} connections.

---
CRITICAL INSTRUCTIONS:
1. **You MUST reference the "USER'S STATED MISSION OUTCOME" in your response.**
2. **You MUST ONLY suggest nodes from the "LOGIC TOOLBOX" above. Use the exact IDs (e.g., learning_crisis, cascade_training).** DO NOT invent new node types.
3. **Format your response as:**
   ### Recommended Connections:
   - Connect [source_node_id] -> [target_node_id] (Reason)
   
   ### Detailing Suggestions:
   - For [node_id], add: (specific advice)

4. If the canvas is empty, guide the user to first add foundation nodes.
5. Be concise and actionable.
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
