import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Check if the Service Role Key exists
// This key bypasses Row Level Security (RLS) - Handle with care!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

// Create a single instance of the Admin Client
// We use the 'supabase-js' library directly here (instead of @supabase/ssr) 
// because admin tasks usually don't involve browser cookies/sessions.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false, // Not needed for admin tasks
      persistSession: false,
    },
  }
);