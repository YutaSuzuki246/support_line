import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getEscalationById(id: string) {
  const { data, error } = await supabase
    .from('escalations')
    .select('*, question:questions(*), escalated_by_user:users!escalated_by(*), escalated_to_user:users!escalated_to(*)')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function getEscalationsByQuestionId(questionId: string) {
  const { data, error } = await supabase
    .from('escalations')
    .select('*, escalated_by_user:users!escalated_by(*), escalated_to_user:users!escalated_to(*)')
    .eq('question_id', questionId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getEscalationsByStatus(status: string) {
  const { data, error } = await supabase
    .from('escalations')
    .select('*, question:questions(*), escalated_by_user:users!escalated_by(*), escalated_to_user:users!escalated_to(*)')
    .eq('status', status)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getEscalationsByEscalatedTo(userId: string) {
  const { data, error } = await supabase
    .from('escalations')
    .select('*, question:questions(*), escalated_by_user:users!escalated_by(*)')
    .eq('escalated_to', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createEscalation(
  escalation: Omit<Database['public']['Tables']['escalations']['Insert'], 'id'>
) {
  const { data, error } = await supabase
    .from('escalations')
    .insert(escalation)
    .select()
    .single();
  return { data, error };
}

export async function updateEscalation(
  id: string,
  update: Partial<Database['public']['Tables']['escalations']['Update']>
) {
  const { data, error } = await supabase
    .from('escalations')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function resolveEscalation(id: string) {
  const { data, error } = await supabase
    .from('escalations')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

