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

/**
 * 受講生がメッセージを送った時にcustomersテーブルを更新
 */
export async function updateCustomerOnMessage(customerId: string) {
  return updateCustomerByLineUserId(
    (await getCustomerById(customerId))?.data?.line_user_id || '',
    {
      last_customer_message_at: new Date().toISOString(),
      has_unreplied_messages: true,
    }
  );
}

/**
 * 運営が返信した時にcustomersテーブルを更新
 */
export async function updateCustomerOnReply(customerId: string) {
  return updateCustomerByLineUserId(
    (await getCustomerById(customerId))?.data?.line_user_id || '',
    {
      last_admin_reply_at: new Date().toISOString(),
      has_unreplied_messages: false,
    }
  );
}

/**
 * customer_idからcustomerを取得
 */
export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/**
 * customerの担当者を更新
 */
export async function updateCustomerAssignedTo(customerId: string, userId: string | null) {
  const { data, error } = await supabase
    .from('customers')
    .update({ assigned_to: userId })
    .eq('id', customerId)
    .select()
    .single();
  return { data, error };
}

