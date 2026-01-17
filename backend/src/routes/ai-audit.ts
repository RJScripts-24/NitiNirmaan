import { Router } from 'express';
import Groq from 'groq-sdk';

export const aiAuditRouter = Router();

// Lazy initialization - create client only when needed
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

// POST /api/ai-audit
aiAuditRouter.post('/', async (req, res) => {
    console.log('🤖 [ai-audit] Received audit request');

    try {
        const { graphData, projectContext } = req.body;

        if (!graphData) {
            return res.status(400).json({ error: 'Graph data is required' });
        }

        const { mode = 'FLN', region = 'Bihar', problemStatement = '' } = projectContext || {};

        console.log(`📊 [ai-audit] Context: Mode=${mode}, Region=${region}`);

        const systemPrompt = `You are a Senior Monitoring & Evaluation (M&E) Expert for Niti Aayog. Your job is to audit a program design Logic Model.

Rules:
1. Check the Logic Chain: Flag any 'Magical Jumps' (e.g., Input connected directly to Impact without an Outcome/Practice Change).
2. Check Stakeholders: 
   - If Mode is 'FLN' and Region is 'Bihar', complain if 'Jeevika' or 'CRCC' is missing. 
   - If Mode is 'Career', complain if 'Employer' linkage is missing.
3. Check Feasibility: If the problem is 'huge' (e.g. millions of students) but resources are 'tiny' (e.g. 2 volunteers), flag a Risk.

Input Context:
- Mode: ${mode}
- Region: ${region}
- Problem Statement: "${problemStatement}"

Output Format (Strict JSON):
Return a JSON object with this shape:
{
  "score": number, // 0-100 logic score
  "summary": "One sentence summary of the audit.",
  "critical_gaps": [ "string" ], // Major logic breaks (Red)
  "warnings": [ "string" ], // Missing best practices (Yellow)
  "regional_insights": [ "string" ], // Specific to the location (Blue)
  "suggestions": [ "string" ] // Actionable fixes
}`;

        const userPrompt = `Audit this Logic Model Graph:

Graph Data:
${JSON.stringify(graphData, null, 2)}

Provide your analysis as a strict JSON object.`;

        console.log('🚀 [ai-audit] Calling Groq API...');

        const completion = await getGroqClient().chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2, // Lower temperature for more consistent audit results
            max_tokens: 1024,
            response_format: { type: 'json_object' }
        });

        const aiResponseText = completion.choices[0]?.message?.content || '{}';
        console.log('✅ [ai-audit] Groq response received');

        let aiResponse;
        try {
            aiResponse = JSON.parse(aiResponseText);
        } catch (parseError) {
            console.error('❌ [ai-audit] Failed to parse AI response:', parseError);
            // Return a safe fallback error structure instead of crashing
            return res.status(500).json({
                error: 'Failed to parse AI response',
                raw: aiResponseText
            });
        }

        res.json(aiResponse);

    } catch (error: any) {
        console.error('❌ [ai-audit] Error:', error);
        res.status(500).json({
            error: 'AI audit failed',
            message: error.message
        });
    }
});
