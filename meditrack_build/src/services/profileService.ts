import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export async function getProfiles(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createProfile(
  userId: string,
  name: string,
  relationship: string
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: userId, name, relationship })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  profileId: string,
  updates: { name?: string; relationship?: string }
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfile(profileId: string): Promise<void> {
  // Don't allow deleting default profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_default')
    .eq('id', profileId)
    .single();

  if (profile?.is_default) {
    throw new Error('Cannot delete the default profile');
  }

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId);

  if (error) throw error;
}

export async function verifyProfileOwnership(
  profileId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .eq('user_id', userId)
    .single();

  return !!data;
}
