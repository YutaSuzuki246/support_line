import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getUserByLineUserId(lineUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single();
  return { data, error };
}

export async function createUser(user: Omit<Database['public']['Tables']['users']['Insert'], 'id'>) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .single();
  return { data, error };
}

export async function updateUserByLineUserId(lineUserId: string, update: Partial<Database['public']['Tables']['users']['Update']>) {
  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('line_user_id', lineUserId)
    .single();
  return { data, error };
}

export async function upsertUser(user: Database['public']['Tables']['users']['Insert']) {
  const { data, error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'line_user_id' })
    .single();
  return { data, error };
}

export async function deleteUserByLineUserId(lineUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('line_user_id', lineUserId)
    .single();
  return { data, error };
}

export async function updateLastAccessed(lineUserId: string) {
  return updateUserByLineUserId(lineUserId, { last_accessed_at: new Date().toISOString() });
}
