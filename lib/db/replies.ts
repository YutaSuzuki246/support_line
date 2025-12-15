import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getReplyById(id: string) {
  const { data, error } = await supabase
    .from('replies')
    .select('*, question:questions(*), admin_user:users(*), template:templates(*)')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function getRepliesByQuestionId(questionId: string) {
  const { data, error } = await supabase
    .from('replies')
    .select('*, admin_user:users(*), template:templates(*)')
    .eq('question_id', questionId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createReply(
  reply: Omit<Database['public']['Tables']['replies']['Insert'], 'id'>
) {
  const { data, error } = await supabase
    .from('replies')
    .insert(reply)
    .select()
    .single();
  return { data, error };
}

export async function updateReply(
  id: string,
  update: Partial<Database['public']['Tables']['replies']['Update']>
) {
  const { data, error } = await supabase
    .from('replies')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function markReplyAsSuccess(replyId: string) {
  const { data, error } = await supabase
    .from('replies')
    .update({ send_result: 'success', sent_at: new Date().toISOString() })
    .eq('id', replyId)
    .select()
    .single();
  return { data, error };
}

export async function markReplyAsFailed(replyId: string, errorMessage: string) {
  const { data, error } = await supabase
    .from('replies')
    .update({ send_result: 'fail', error_message: errorMessage })
    .eq('id', replyId)
    .select()
    .single();
  return { data, error };
}

