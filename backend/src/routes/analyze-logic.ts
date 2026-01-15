import { Router } from 'express';
import Groq from 'groq-sdk';

export const analyzeLogicRouter = Router();

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

// POST /api/analyze-logic
analyzeLogicRouter.post('/', async (req, res) => {
    console.log('🤖 [analyze-logic] Received request');

    try {
        const { lfa, nodes, edges } = req.body;

        if (!lfa) {
            console.warn('⚠️ [analyze-logic] No LFA provided');
            return res.status(400).json({ error: 'LFA document is required' });
        }

        console.log('📊 [analyze-logic] LFA:', JSON.stringify(lfa, null, 2));
        console.log('📊 [analyze-logic] Nodes count:', nodes?.length);
        console.log('📊 [analyze-logic] Edges count:', edges?.length);

        // Construct prompt for Groq
        const systemPrompt = `You are an expert in Logical Framework Analysis (LFA) for education programs in India. 
You will be given an LFA document structure generated from a visual logic model (React Flow canvas).
Analyze it for logical consistency, completeness, and adherence to best practices for FLN (Foundational Literacy and Numeracy) programs.

Your response MUST be a valid JSON object with this structure:
{
  "shortcomings": [
    "Description of issue 1",
    "Description of issue 2"
  ],
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2"
  ],
  "overallAssessment": "A brief 1-2 sentence summary of the logic model quality"
}

If the logic flow is sound and complete, return empty arrays for shortcomings and suggestions.
Focus on practical issues like:
- Missing goal or vision
- No practice changes (outcomes) defined
- Interventions not connected to practice changes
- Missing indicators
- Logical gaps in the theory of change
- Unrealistic assumptions`;

        const userPrompt = `Analyze this LFA document for an FLN education program:

LFA Document:
${JSON.stringify(lfa, null, 2)}

Canvas has ${nodes?.length || 0} nodes and ${edges?.length || 0} connections.

Provide your analysis as a JSON object.`;

        console.log('🚀 [analyze-logic] Calling Groq API...');

        const completion = await getGroqClient().chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 1024,
            response_format: { type: 'json_object' }
        });

        const aiResponseText = completion.choices[0]?.message?.content || '{}';
        console.log('✅ [analyze-logic] Groq response:', aiResponseText);

        let aiResponse;
        try {
            aiResponse = JSON.parse(aiResponseText);
        } catch (parseError) {
            console.error('❌ [analyze-logic] Failed to parse AI response:', parseError);
            aiResponse = { shortcomings: [], suggestions: [], overallAssessment: 'Unable to parse AI response' };
        }

        res.json({
            shortcomings: aiResponse.shortcomings || [],
            suggestions: aiResponse.suggestions || [],
            overallAssessment: aiResponse.overallAssessment || 'Analysis complete'
        });

    } catch (error: any) {
        console.error('❌ [analyze-logic] Error:', error);
        res.status(500).json({
            error: 'AI analysis failed',
            message: error.message,
            // Fallback shortcomings for frontend to display
            shortcomings: ['AI analysis service temporarily unavailable. Please verify your logic manually.']
        });
    }
});
