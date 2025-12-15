import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getQuestionById } from '@/lib/db/questions';
import { createReply, markReplyAsSuccess, markReplyAsFailed } from '@/lib/db/replies';
import { createQuestionMessage } from '@/lib/db/questionMessages';
import { updateCustomerOnReply } from '@/lib/db/customers';
import { getUserByLineUserId } from '@/lib/db/users';
import { verifyLiffToken } from '@/lib/auth/liff';

const LINE_CHANNEL_ACCESS_TOKEN2 = process.env.LINE_CHANNEL_ACCESS_TOKEN2!; // アカウント2（質問用）のトークンでpush送信

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // LIFF認証
    const { userId: lineUserId, error: authError } = await verifyLiffToken(req);
    if (authError || !lineUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー情報を取得
    const { data: user } = await getUserByLineUserId(lineUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: questionId } = await params;
    const { replyText, templateId, originalTemplateText } = await req.json();

    if (!replyText) {
      return NextResponse.json({ error: 'replyText is required' }, { status: 400 });
    }

    // 質問データを取得
    const question = await getQuestionById(questionId);
    if (question.error || !question.data) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const questionData = question.data;

    // 返信レコードを作成（送信前に作成）
    const reply = await createReply({
      question_id: questionId,
      admin_user_id: user.id,
      template_id: templateId || null,
      reply_text: replyText,
      original_template_text: originalTemplateText || null,
      send_result: 'pending',
    });

    if (reply.error) {
      return NextResponse.json({ error: 'Failed to create reply record' }, { status: 500 });
    }

    const replyId = reply.data!.id;

    // アカウント2（質問用）のトークンでpush message送信
    try {
      // customer情報を取得（questionDataに既に含まれている）
      const customer = (questionData as any).customer;
      if (!customer || !customer.line_user_id) {
        throw new Error('Customer line_user_id not found');
      }

      const customerLineUserId = customer.line_user_id;

      // LINE Messaging APIでpush message送信
      const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN2}`,
        },
        body: JSON.stringify({
          to: customerLineUserId,
          messages: [
            {
              type: 'text',
              text: replyText,
            },
          ],
        }),
      });

      if (!pushRes.ok) {
        const errorText = await pushRes.text();
        console.error('Push message failed:', errorText);

        // 失敗を記録
        await markReplyAsFailed(replyId, errorText);

        return NextResponse.json(
          { error: 'Failed to send reply', details: errorText },
          { status: 500 }
        );
      }

      // 成功を記録
      await markReplyAsSuccess(replyId);

      // question_messagesにも返信を保存
      // 返信にはLINEのmessageIdがないため、UUIDを生成
      await createQuestionMessage({
        question_id: questionId,
        line_message_id: randomUUID(), // 返信にはLINE messageIdがないためUUIDを使用
        content_type: 'text',
        content_text: replyText,
        sender_type: 'admin',
        customer_id: null,
        admin_user_id: user.id,
      });

      // customersテーブルを更新（最後の返信時刻、未返信フラグをfalseに）
      await updateCustomerOnReply(questionData.customer_id);

      return NextResponse.json({
        success: true,
        reply: reply.data,
      });
    } catch (error: any) {
      console.error('Reply send error:', error);

      // 失敗を記録
      await markReplyAsFailed(replyId, error.message || 'Unknown error');

      return NextResponse.json(
        { error: 'Failed to send reply', details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
