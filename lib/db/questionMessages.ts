import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getQuestionMessagesByQuestionId(questionId: string) {
  const { data, error } = await supabase
    .from('question_messages')
    .select('*, customer:customers(*), admin_user:users(*)')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true });
  return { data, error };
}

export async function createQuestionMessage(
  message: Omit<Database['public']['Tables']['question_messages']['Insert'], 'id'>
) {
  const { data, error } = await supabase
    .from('question_messages')
    .insert(message)
    .select()
    .single();
  return { data, error };
}

export async function getQuestionMessageByLineMessageId(lineMessageId: string) {
  const { data, error } = await supabase
    .from('question_messages')
    .select('*')
    .eq('line_message_id', lineMessageId)
    .single();
  return { data, error };
}

