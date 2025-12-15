import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getQuestionNotesByQuestionId(questionId: string) {
  const { data, error } = await supabase
    .from('question_notes')
    .select('*, user:users(*)')
    .eq('question_id', questionId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createQuestionNote(
  note: Omit<Database['public']['Tables']['question_notes']['Insert'], 'id'>
) {
  const { data, error } = await supabase
    .from('question_notes')
    .insert(note)
    .select()
    .single();
  return { data, error };
}

export async function deleteQuestionNote(id: string) {
  const { data, error } = await supabase
    .from('question_notes')
    .delete()
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

