import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/ai/groq';


export async function POST(req: NextRequest) {
    try {
        const { projectTitle, description, nodes, edges } = await req.json();

        if (!projectTitle || !nodes) {
            return new NextResponse('Missing project data', { status: 400 });
        }

        // 1. Build Prompt for the AI
        const systemPrompt = `You are a Fundraising Expert. 
    Create a 5-Slide Pitch Deck Summary for this education program.
    Return a JSON object with this structure:
    {
      "slides": [
        { "title": "Slide Title", "content": "Bullet points..." }
      ]
    }`;

        // Convert graph to a summary string
        const graphContext = `
      Project: ${projectTitle}
      Description: ${description}
      Key Stakeholders: ${nodes.filter((n: any) => n.type === 'stakeholder').map((n: any) => n.data.label).join(', ')}
      Interventions: ${nodes.filter((n: any) => n.type === 'intervention').map((n: any) => n.data.label).join(', ')}
      Goals: ${nodes.filter((n: any) => n.type === 'outcome').map((n: any) => n.data.label).join(', ')}
    `;

        // 2. Generate Content using Llama 3 (via Groq)
        const deckContent = await generateJSON(systemPrompt, graphContext);

        if (!deckContent) {
            return new NextResponse('AI generation failed', { status: 500 });
        }

        // 3. Return JSON
        // In a real app, we might generate a PPTX file here using 'pptxgenjs',
        // but returning structure for the Frontend to render is efficient for MVP.
        return NextResponse.json(deckContent);

    } catch (error) {
        console.error('Pitch Deck API Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
