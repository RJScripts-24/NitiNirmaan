import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types.js';

// Initialize Supabase client lazily
let supabaseClient: SupabaseClient<Database> | null = null;

function getEnvVars() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY)');
    }

    return { supabaseUrl, supabaseKey };
}

/**
 * Get the Supabase client (lazy initialization)
 */
export function getSupabase(): SupabaseClient<Database> {
    if (!supabaseClient) {
        const { supabaseUrl, supabaseKey } = getEnvVars();
        supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
    }
    return supabaseClient;
}

// Backwards compatible export
export const supabase = new Proxy({} as SupabaseClient<Database>, {
    get(_, prop) {
        return getSupabase()[prop as keyof SupabaseClient<Database>];
    }
});

/**
 * Creates a Supabase client with the user's JWT token for authenticated requests.
 * @param token - JWT token from Authorization header
 */
export function createAuthenticatedClient(token: string) {
    const { supabaseUrl, supabaseKey } = getEnvVars();
    return createClient<Database>(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
}

/**
 * Extracts user from a Supabase client using the auth token
 */
export async function getUserFromToken(token: string) {
    const client = createAuthenticatedClient(token);
    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) {
        console.error('🔑 [Auth] Token validation failed:', error?.message || 'No user found');
        return null;
    }

    console.log('🔑 [Auth] Token validated for user:', user.id);
    return { user, client };
}

export default supabase;
