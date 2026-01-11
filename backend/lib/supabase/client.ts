import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

/**
 * Creates a Supabase Client for use in Client Components (Browser).
 * * Usage:
 * const supabase = createClient();
 * * Why a function? 
 * Next.js App Router requires a fresh client instance to ensure 
 * cookies are handled correctly during hydration.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}