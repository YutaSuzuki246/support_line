import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

/**
 * 受講生との会話一覧を取得（最新メッセージ、未返信数を含む）
 */
export async function getConversations(hasUnreplied = true) {
  // まず、メッセージがあるcustomerを取得
  const { data: messages, error: messagesError } = await supabase
    .from('question_messages')
    .select('customer_id')
    .not('customer_id', 'is', null)
    .order('created_at', { ascending: false });

  if (messagesError) {
    return { data: null, error: messagesError };
  }

  const customerIds = Array.from(
    new Set(messages?.map((m) => m.customer_id).filter((id): id is string => Boolean(id)) || [])
  );

  if (customerIds.length === 0) {
    return { data: [], error: null };
  }

  // customer情報と最新メッセージ、未返信数を取得
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .in('id', customerIds);

  if (customersError) {
    return { data: null, error: customersError };
  }

  // 各customerの最新メッセージと未返信数を取得
  const conversations = await Promise.all(
    (customers || []).map(async (customer) => {
      // 最新メッセージを取得
      const { data: latestMessage } = await supabase
        .from('question_messages')
        .select('*, customer:customers(*), admin_user:users(*)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 未返信の質問数を取得
      const { count: unrepliedCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customer.id)
        .eq('status', 'unreplied');

      // 未返信の質問リストを取得
      const { data: unrepliedQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('status', 'unreplied')
        .order('created_at', { ascending: false });

      // 最後に返信した時刻を取得
      const { data: lastReply } = await supabase
        .from('question_messages')
        .select('created_at')
        .eq('customer_id', customer.id)
        .eq('sender_type', 'admin')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        customer,
        latest_message: latestMessage || null,
        unreplied_count: unrepliedCount || 0,
        unreplied_questions: unrepliedQuestions || [],
        last_replied_at: lastReply?.created_at || null,
      };
    })
  );

  // 未返信があるもののみフィルタ
  let filtered = conversations;
  if (hasUnreplied) {
    filtered = conversations.filter((conv) => conv.unreplied_count > 0);
  }

  // 最新メッセージの時刻でソート
  filtered.sort((a, b) => {
    const aTime = a.latest_message?.created_at || '';
    const bTime = b.latest_message?.created_at || '';
    return bTime.localeCompare(aTime);
  });

  return { data: filtered, error: null };
}

/**
 * 特定の受講生との全会話履歴を取得
 */
export async function getConversationByCustomerId(customerId: string) {
  // customer情報を取得
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (customerError || !customer) {
    return { data: null, error: customerError };
  }

  // 全会話履歴を取得
  const { data: messages, error: messagesError } = await supabase
    .from('question_messages')
    .select('*, customer:customers(*), admin_user:users(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    return { data: null, error: messagesError };
  }

  // 未返信の質問を取得
  const { data: unrepliedQuestions } = await supabase
    .from('questions')
    .select('*')
    .eq('customer_id', customerId)
    .eq('status', 'unreplied')
    .order('created_at', { ascending: false });

  return {
    data: {
      customer,
      messages: messages || [],
      unreplied_questions: unrepliedQuestions || [],
    },
    error: null,
  };
}

