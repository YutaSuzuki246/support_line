import { NextRequest, NextResponse } from 'next/server';
import { getUnrepliedQuestions, getQuestionsByStatus } from '@/lib/db/questions';
import { getUserByLineUserId } from '@/lib/db/users';
import { verifyLiffToken } from '@/lib/auth/liff';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
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

    // Query Parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || 'unreplied';
    const assignedTo = searchParams.get('assigned_to');

    let questions;
    if (status === 'unreplied') {
      questions = await getUnrepliedQuestions(assignedTo || undefined);
    } else {
      questions = await getQuestionsByStatus(status);
    }

    if (questions.error) {
      return NextResponse.json({ error: questions.error.message }, { status: 500 });
    }

    return NextResponse.json({
      questions: questions.data || [],
      meta: {
        total: questions.data?.length || 0,
        status,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

