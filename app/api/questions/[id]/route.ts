import { NextRequest, NextResponse } from 'next/server';
import { getQuestionById } from '@/lib/db/questions';
import { getQuestionMessagesByQuestionId } from '@/lib/db/questionMessages';
import { getQuestionNotesByQuestionId } from '@/lib/db/questionNotes';
import { getRepliesByQuestionId } from '@/lib/db/replies';
import { getUserByLineUserId } from '@/lib/db/users';
import { verifyLiffToken } from '@/lib/auth/liff';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // LIFF認証
    const { userId: lineUserId, error: authError } = await verifyLiffToken(req);
    if (authError || !lineUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー情報を取得（存在確認・権限チェック）
    const { data: user } = await getUserByLineUserId(lineUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const questionId = params.id;

    // 質問詳細を取得
    const question = await getQuestionById(questionId);
    if (question.error || !question.data) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // 関連データを取得
    const [messages, notes, replies] = await Promise.all([
      getQuestionMessagesByQuestionId(questionId),
      getQuestionNotesByQuestionId(questionId),
      getRepliesByQuestionId(questionId),
    ]);

    return NextResponse.json({
      question: question.data,
      messages: messages.data || [],
      notes: notes.data || [],
      replies: replies.data || [],
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

