import { NextRequest, NextResponse } from 'next/server';
import { getConversations } from '@/lib/db/conversations';
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
    const hasUnreplied = searchParams.get('has_unreplied') !== 'false'; // デフォルトはtrue

    const result = await getConversations(hasUnreplied);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      conversations: result.data || [],
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

