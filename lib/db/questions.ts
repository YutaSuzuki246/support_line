import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getQuestionById(id: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, customer:customers(*), assigned_user:users(*)')
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

export async function getUnrepliedQuestions(assignedTo?: string) {
  let query = supabase
    .from('questions')
    .select('*, customer:customers(*), assigned_user:users(*)')
    .eq('status', 'unreplied')
    .order('created_at', { ascending: false });

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo);
  } else {
    query = query.is('assigned_to', null);
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

export async function updateQuestionWithLock(
  id: string,
  update: Partial<Database['public']['Tables']['questions']['Update']>,
  expectedLockVersion: number
) {
  // 楽観ロック: lock_versionをチェック
  const { data, error } = await supabase
    .from('questions')
    .update({ ...update, lock_version: expectedLockVersion + 1 })
    .eq('id', id)
    .eq('lock_version', expectedLockVersion)
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return {
      data: null,
      error: { message: '楽観ロックエラー: 他のユーザーが先に更新しました', code: 'LOCK_VERSION_MISMATCH' },
    };
  }

  return { data, error: null };
}

export async function assignQuestion(questionId: string, userId: string) {
  // 未割当または現在の担当者のみ更新可能
  const { data, error } = await supabase
    .from('questions')
    .update({ assigned_to: userId })
    .eq('id', questionId)
    .or('assigned_to.is.null,assigned_to.eq.' + userId)
    .select()
    .single();
  return { data, error };
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

