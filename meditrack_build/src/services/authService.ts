import { supabase } from '@/lib/supabase';
import { twilioClient, verifyServiceSid } from '@/lib/twilio';
import { createToken } from '@/lib/auth';
import type { User } from '@/types';

export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone, channel: 'sms' });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP';
    return { success: false, error: message };
  }
}

export async function verifyOTP(
  phone: string,
  code: string
): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
  try {
    const verification = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code });

    if (verification.status !== 'approved') {
      return { success: false, error: 'Invalid OTP code' };
    }

    // Find existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    let user: User;

    if (existingUser) {
      user = existingUser;
      // Update last login
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ phone })
        .select()
        .single();

      if (createError || !newUser) {
        throw new Error(createError?.message || 'Failed to create user');
      }

      user = newUser;

      // Create default "Myself" profile
      await supabase.from('profiles').insert({
        user_id: user.id,
        name: 'Myself',
        relationship: 'self',
        is_default: true,
      });
    }

    const token = await createToken({ userId: user.id, phone: user.phone });
    return { success: true, token, user };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return { success: false, error: message };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function updateUser(
  userId: string,
  updates: { name?: string }
): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
