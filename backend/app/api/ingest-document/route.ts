import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { Database } from '@/types/database.types';

export async function POST(req: NextRequest) {
    try {
        const { title, content, category } = await req.json();

        if (!content || !title) {
            return new NextResponse('Missing content', { status: 400 });
        }

        // 1. Generate Embedding using Hugging Face
        const vector = await generateEmbedding(content);

        // 2. Store in Supabase
        const cookieStore = await cookies();
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n) => cookieStore.get(n)?.value } }
        );


        // Check Admin (Simplified: In production, check role='admin')
        const { error } = await supabase.from('knowledge_docs').insert({
            title,
            content_chunk: content,
            embedding: vector, // This requires the 'vector' type in DB
            category: category || 'LFA_GUIDE',
        });

        if (error) {
            console.error('DB Insert Error', error);
            return new NextResponse('Failed to store document', { status: 500 });
        }

        return new NextResponse('Document Ingested Successfully', { status: 200 });

    } catch (error) {
        console.error('Ingest API Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
