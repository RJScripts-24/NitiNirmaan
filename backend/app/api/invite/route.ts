import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

export async function POST(req: NextRequest) {
    try {
        const { email, projectId, role } = await req.json();

        if (!email || !projectId) {
            return new NextResponse('Missing email or projectId', { status: 400 });
        }

        const cookieStore = cookies();
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n) => cookieStore.get(n)?.value } }
        );

        // 1. Check if user making request is OWNER
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { data: project } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();

        if (project?.user_id !== user.id) {
            return new NextResponse('Only Project Owner can invite', { status: 403 });
        }

        // 2. Find the user to invite by Email
        // Note: In Supabase, searching auth.users directly needs Admin Key. 
        // For Hackathon, we search the 'profiles' table which is replicable.
        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (!targetProfile) {
            return new NextResponse('User not found on NitiNirmaan. Ask them to sign up first.', { status: 404 });
        }

        // 3. Add to Project Members
        const { error } = await supabase
            .from('project_members')
            .insert({
                project_id: projectId,
                user_id: targetProfile.id,
                role: role || 'viewer',
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return new NextResponse('User is already a member', { status: 409 });
            }
            throw error;
        }

        return new NextResponse('Invitation Sent', { status: 200 });

    } catch (error) {
        console.error('Invite Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
