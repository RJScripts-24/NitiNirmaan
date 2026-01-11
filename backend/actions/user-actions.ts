'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

// Helper: Supabase Client
const createClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { try { cookieStore.set({ name, value, ...options }); } catch (e) {} },
        remove(name: string, options: CookieOptions) { try { cookieStore.set({ name, value: '', ...options }); } catch (e) {} },
      },
    }
  );
};

// --- ACTION 1: GET USER PROFILE (For Dashboard & Settings) ---
export async function getUserProfile() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Fetch Profile Error:', error);
    return null;
  }

  return profile;
}

// --- ACTION 2: UPDATE PROFILE & LOGO (For PDF Branding) ---
export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 1. Extract Text Data
  const fullName = formData.get('fullName') as string;
  const orgName = formData.get('orgName') as string;
  const website = formData.get('website') as string;
  
  // 2. Handle Logo Upload (If a new file is provided)
  const logoFile = formData.get('logo') as File | null;
  let logoUrl = null;

  if (logoFile && logoFile.size > 0) {
    // Validate File Type
    if (!logoFile.type.startsWith('image/')) {
      return { error: 'Invalid file type. Please upload an image.' };
    }

    // Generate Unique Path: org-assets/{userId}/logo-{timestamp}.png
    const filePath = `${user.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`;

    const { error: uploadError } = await supabase.storage
      .from('org-assets')
      .upload(filePath, logoFile, {
        upsert: true,
      });

    if (uploadError) {
      console.error('Logo Upload Error:', uploadError);
      return { error: 'Failed to upload logo.' };
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('org-assets')
      .getPublicUrl(filePath);
      
    logoUrl = publicUrl;
  }

  // 3. Update Database
  const updateData: any = {
    full_name: fullName,
    org_name: orgName,
    website: website,
    updated_at: new Date().toISOString(),
  };

  // Only update logo_url if a new one was uploaded
  if (logoUrl) {
    updateData.avatar_url = logoUrl; // We use avatar_url field for Org Logo in this schema
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (updateError) {
    return { error: 'Failed to update profile.' };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard'); // Update branding on dashboard too
  return { success: 'Organization profile updated.' };
}

// --- ACTION 3: GET TEAM MEMBERS ---
// Note: In a Hackathon MVP, usually everyone is an "Admin". 
// This fetches other users who belong to the same 'org_name' (Basic implementation)
export async function getTeamMembers() {
  const supabase = createClient();
  
  // 1. Get Current User's Org
  const userProfile = await getUserProfile();
  if (!userProfile?.org_name) return [];

  // 2. Find others with the same Org Name
  const { data: team, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, gamification_level')
    .eq('org_name', userProfile.org_name)
    .neq('id', userProfile.id); // Exclude self

  if (error) return [];
  
  return team;
}

// --- ACTION 4: REMOVE TEAM MEMBER ---
// Strictly for the "Admin" of the org (Hackathon simplification: anyone can remove)
export async function removeTeamMember(userIdToRemove: string) {
  const supabase = createClient();
  
  // For MVP: We just set their Org Name to null, effectively kicking them out
  const { error } = await supabase
    .from('profiles')
    .update({ org_name: null })
    .eq('id', userIdToRemove);

  if (error) return { error: 'Failed to remove member.' };

  revalidatePath('/settings');
  return { success: 'Member removed from organization.' };
}