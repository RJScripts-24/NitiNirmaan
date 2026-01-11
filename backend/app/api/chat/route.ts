import { streamChat } from '@/lib/ai/groq';

import { PERSONAS } from '@/lib/ai/prompts';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new NextResponse('Missing messages array', { status: 400 });
        }

        // Get the stream from our helper
        // We use the MENTOR persona for the chat widget
        const responseStream = await streamChat(PERSONAS.MENTOR, messages);

        // Return a streaming response
        // Vercel/Next.js supports passing the standard Web Stream directly
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of responseStream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return new NextResponse('Internal AI Error', { status: 500 });
    }
}
