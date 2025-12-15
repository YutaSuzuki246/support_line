import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getQuestionById(id: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function getQuestionsByCustomerId(customerId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getQuestionsByStatus(status: string, assignedTo?: string) {
  let query = supabase
    .from('questions')
    .select('*, customer:customers(*), assigned_user:users(*)')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo);
  }

  const { data, error } = await query;
  return { data, error };
}

// Note: getUnrepliedQuestions is deprecated. Use getConversations with has_unreplied=true instead.
export async function getUnrepliedQuestions(assignedTo?: string) {
  // Filter by customers.has_unreplied_messages instead of questions.status
  let query = supabase
    .from('questions')
    .select('*, customer:customers!inner(*)')
    .eq('customer.has_unreplied_messages', true)
    .order('created_at', { ascending: false });

  if (assignedTo) {
    query = query.eq('customer.assigned_to', assignedTo);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createQuestion(
  question: Omit<Database['public']['Tables']['questions']['Insert'], 'id'>
) {
  const { data, error } = await supabase
    .from('questions')
    .insert(question)
    .select()
    .single();
  return { data, error };
}

export async function updateQuestion(
  id: string,
  update: Partial<Database['public']['Tables']['questions']['Update']>
) {
  const { data, error } = await supabase
    .from('questions')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// Note: updateQuestionWithLock is deprecated. Lock version has been removed from questions table.
// Use updateQuestion instead.
export async function updateQuestionWithLock(
  id: string,
  update: Partial<Database['public']['Tables']['questions']['Update']>,
  expectedLockVersion: number
) {
  // Lock version is no longer used, just update directly
  return updateQuestion(id, update);
}

// Note: assignQuestion is deprecated. Use updateCustomerAssignedTo in customers.ts instead.
export async function assignQuestion(questionId: string, userId: string) {
  // Get customer_id from question, then update customer's assigned_to
  const { data: question } = await getQuestionById(questionId);
  if (!question) {
    return { data: null, error: { message: 'Question not found' } };
  }

  const { updateCustomerAssignedTo } = await import('./customers');
  return updateCustomerAssignedTo(question.customer_id, userId);
}

export async function deleteQuestion(id: string) {
  const { data, error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

