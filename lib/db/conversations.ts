import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

/**
 * 受講生との会話一覧を取得（最新メッセージ、未返信数を含む）
 */
export async function getConversations(hasUnreplied = true) {
  // customer情報を取得（メッセージがあるもののみ）
  let customersQuery = supabase
    .from('customers')
    .select('*');

  // 未返信があるもののみフィルタ
  if (hasUnreplied) {
    customersQuery = customersQuery.eq('has_unreplied_messages', true);
  }

  // メッセージがあるcustomerのみ（last_customer_message_atがnullでない）
  customersQuery = customersQuery.not('last_customer_message_at', 'is', null);

  // 最新メッセージ時刻でソート
  customersQuery = customersQuery.order('last_customer_message_at', { ascending: false });

  const { data: customers, error: customersError } = await customersQuery;

  if (customersError) {
    return { data: null, error: customersError };
  }

  if (!customers || customers.length === 0) {
    return { data: [], error: null };
  }

  // 各customerの最新メッセージを取得
  const conversations = await Promise.all(
    customers.map(async (customer) => {
      // customerに関連するquestion_idsを取得
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('customer_id', customer.id);

      const questionIds = questions?.map((q) => q.id) || [];

      let latestMessage = null;
      if (questionIds.length > 0) {
        // 最新メッセージを取得
        const { data: allMessages } = await supabase
          .from('question_messages')
          .select('*, customer:customers(*), admin_user:users(*)')
          .in('question_id', questionIds)
          .order('created_at', { ascending: false })
          .limit(1);

        latestMessage = allMessages?.[0] || null;
      }

      return {
        customer,
        latest_message: latestMessage,
        unreplied_count: customer.has_unreplied_messages ? 1 : 0,
        unreplied_questions: [], // customersテーブルで管理するため空配列
        last_replied_at: customer.last_admin_reply_at || null,
      };
    })
  );

  return { data: conversations, error: null };
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

  // 全会話履歴を取得（questionsテーブルをJOINしてcustomerに関連する全メッセージを取得）
  // まず、customerに関連するquestion_idsを取得
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id')
    .eq('customer_id', customerId);

  if (questionsError) {
    return { data: null, error: questionsError };
  }

  const questionIds = questions?.map((q) => q.id) || [];

  if (questionIds.length === 0) {
    return {
      data: {
        customer,
        messages: [],
        unreplied_questions: [],
      },
      error: null,
    };
  }

  // question_idsを使ってメッセージを取得
  const { data: messages, error: messagesError } = await supabase
    .from('question_messages')
    .select('*, customer:customers(*), admin_user:users(*)')
    .in('question_id', questionIds)
    .order('created_at', { ascending: true });

  if (messagesError) {
    return { data: null, error: messagesError };
  }

  // 未返信の質問はcustomersテーブルで管理するため、空配列を返す
  return {
    data: {
      customer,
      messages: messages || [],
      unreplied_questions: [], // customersテーブルで管理
    },
    error: null,
  };
}

