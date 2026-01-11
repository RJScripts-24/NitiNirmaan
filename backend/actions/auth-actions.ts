'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/database.types';

// Helper to create the Supabase Server Client
const createClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// --- ACTION: SIGN UP ---
export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const orgName = formData.get('orgName') as string; // Capture Org Name early for the Profile

  const supabase = createClient();

  // 1. Create User in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Send metadata to trigger profile creation via Database Trigger (recommended)
      // or to be available in the session.
      data: {
        full_name: fullName,
        org_name: orgName,
        gamification_level: 'Level 1: Novice Architect', // Initial Gamification Level
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // 2. Redirect to check email page or dashboard depending on email confirmation settings
  // For hackathons, usually email confirmation is disabled, so we redirect to dashboard
  if (data.session) {
    redirect('/dashboard');
  } else {
    // If email confirmation is enabled
    return { success: 'Check your email to continue the NitiNirmaan quest.' };
  }
}

// --- ACTION: LOGIN ---
export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // On success, redirect to the Command Center
  redirect('/dashboard');
}

// --- ACTION: SIGN OUT ---
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// --- ACTION: FORGOT PASSWORD ---
export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Recovery magic link sent to your email.' };
}

// --- ACTION: GOOGLE OAUTH ---
// Note: This is usually triggered client-side, but if you need a server-action wrapper:
export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}