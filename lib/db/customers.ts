import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getCustomerByLineUserId(lineUserId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single();
  return { data, error };
}

export async function createCustomer(customer: Omit<Database['public']['Tables']['customers']['Insert'], 'id'>) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .single();
  return { data, error };
}

export async function updateCustomerByLineUserId(lineUserId: string, update: Partial<Database['public']['Tables']['customers']['Update']>) {
  const { data, error } = await supabase
    .from('customers')
    .update(update)
    .eq('line_user_id', lineUserId)
    .single();
  return { data, error };
}

export async function upsertCustomer(customer: Database['public']['Tables']['customers']['Insert']) {
  const { data, error } = await supabase
    .from('customers')
    .upsert(customer, { onConflict: 'line_user_id' })
    .single();
  return { data, error };
}

export async function deleteCustomerByLineUserId(lineUserId: string) {
  const { data, error } = await supabase
    .from('customers')
    .delete()
    .eq('line_user_id', lineUserId)
    .single();
  return { data, error };
}

export async function updateLastAccessedCustomer(lineUserId: string) {
  return updateCustomerByLineUserId(lineUserId, { last_accessed_at: new Date().toISOString() });
}

