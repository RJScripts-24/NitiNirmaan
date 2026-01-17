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

        const systemPrompt = `You are a Senior Monitoring & Evaluation (M&E) "Program Architect" for Niti Aayog. Your job is to perform a deep logic audit of a program design graph (Logic Model).
Your goal is to be CRITICAL and CONSTRUCTIVE. You must identify what is MISSING just as much as what is wrong.

CONTEXT:
- Mode: ${mode} (FLN = Foundational Literacy & Numeracy; Career = School-to-Work/Vocational)
- Region: ${region}
- Problem Statement: "${problemStatement}"

DEEP AUDIT RULES:
1. PROBLEM ALIGNMENT CHECK: 
   - Does the graph actually solve the specific "${problemStatement}"? 
   - If the problem mentions "Teacher Absenteeism" but the graph only has "Student Training", flag a Critical Gap.

2. MISSING NODE DETECTION (Domain Specific):
   - If Mode is 'FLN': Look for 'Teacher Training', 'TLM Distribution', 'Community/Jeevika Engagement', 'Pedagogy Shift' nodes. If missing, flag them.
   - If Mode is 'Career': Look for 'Industry Partnership', 'Skill Gap Analysis', 'Job Fair/Placement' nodes. If missing, flag them.
   - If Region is 'Bihar': Check for 'Jeevika' (Self Help Groups) or 'CRCC' involvement.

3. DETAILING CHECK:
   - Identify nodes that are too generic (e.g., "Activity 1", "Training", "Meeting").
   - Identifying nodes disconnected from the main logic flow.

4. LOGIC CHAIN:
   - Flag "Magical Jumps" (Input -> Impact without Outcomes).

OUTPUT FORMAT (Strict JSON):
Return a JSON object with this shape:
{
  "score": number, // 0-100. Be strict. <50 if problem statement is ignored.
  "summary": "2-sentence summary. First sentence on overall logic, second on key missing piece.",
  "critical_gaps": [ "string" ], // Major logic breaks or missing core components (Red)
  "warnings": [ "string" ], // Minor issues (Yellow)
  "missing_nodes": [ "string" ], // Specific suggestions for new nodes to add (Orange). E.g. "Add 'Teacher Training' node"
  "needs_detailing": [ "string" ], // Nodes that are too vague (Blue). E.g. "'Activity 1' needs specific topic"
  "regional_insights": [ "string" ], // Specific to the location/context (Purple)
  "suggestions": [ "string" ] // General improvements
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
