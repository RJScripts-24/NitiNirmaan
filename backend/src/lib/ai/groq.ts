import Groq from 'groq-sdk';

// Initialize Groq Client lazily
// Get your FREE key here: https://console.groq.com/keys
// Add GROQ_API_KEY to your .env
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
    if (!groqClient) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groqClient;
}

// Define the models we will use for NitiNirmaan
// We use Llama 3.3 70B for complex logic (Simulation) and 3.1 8B for fast chat
export const AI_MODELS = {
    COMPLEX: 'llama-3.3-70b-versatile', // For "Simulation Engine" & "Boss Battle"
    FAST: 'llama-3.1-8b-instant',     // For "AI Chat Widget" & suggestions
};

/**
 * Helper to get a structured JSON response from Groq.
 * Essential for the "Simulation Engine" to return parsed errors.
 * @param systemPrompt The persona (e.g., "You are a Critical Funder")
 * @param userPrompt The context (e.g., The list of nodes/edges)
 * @returns Parsed JSON object or null if failure
 */
export async function generateJSON(systemPrompt: string, userPrompt: string) {
    try {
        const completion = await getGroqClient().chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt + " Return ONLY valid JSON." },
                { role: 'user', content: userPrompt },
            ],
            model: AI_MODELS.COMPLEX,
            temperature: 0.2, // Low temperature for consistent logic
            response_format: { type: 'json_object' }, // Enforce JSON mode
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) return null;

        return JSON.parse(content);
    } catch (error) {
        console.error('Groq JSON Generation Error:', error);
        return null;
    }
}

/**
 * Helper for streaming chat responses.
 * Used by the "AI Advisor" widget in the frontend.
 */
export async function streamChat(systemPrompt: string, userMessages: any[]) {
    return getGroqClient().chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            ...userMessages,
        ],
        model: AI_MODELS.FAST,
        temperature: 0.7, // Higher creativity for chat
        stream: true,
    });
}

export { getGroqClient };
