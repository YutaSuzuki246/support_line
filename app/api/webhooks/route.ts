import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getUserByLineUserId,
  createUser,
  updateUserByLineUserId,
  updateLastAccessed,
} from '@/lib/db/users';
import { handleSampleReply } from '@/components/line/SampleReply';
import { promises as fs } from 'fs';
import path from 'path';
import { setupRichMenu1ForUser } from '@/components/line/SampleRichMenu';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;

export const runtime = 'nodejs'; // Node.jsランタイムを指定（Edgeでは不可）

// 署名検証（セキュリティ）
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// 今後の拡張用: 応答ハンドラー配列
const messageReplyHandlers = [
  handleSampleReply,
  // ここに他のハンドラーを追加可能
];

// ユーザー作成・更新処理を関数化
async function upsertUserFromProfile(userId: string, name: string, profileImageUrl: string | null) {
  // 既存ユーザーの確認
  const { data: existingUser, error: selectError } = await getUserByLineUserId(userId);
  if (selectError && selectError.code !== 'PGRST116') {
    console.error('既存ユーザー確認エラー:', selectError);
    return;
  }
  if (existingUser) {
    // 既存ユーザー：最終アクセス情報を更新
    console.log('既存ユーザーを更新中...');
    const { error: updateError } = await updateUserByLineUserId(userId, {
      name: name,
      profile_image_url: profileImageUrl,
      last_accessed_at: new Date().toISOString(),
    });
    if (updateError) {
      console.error('ユーザー更新エラー:', updateError);
    } else {
      console.log('ユーザー情報を更新しました');
    }
  } else {
    // 新規ユーザー：登録
    console.log('新規ユーザーを作成中...');
    const { error: insertError } = await createUser({
      line_user_id: userId,
      name: name,
      profile_image_url: profileImageUrl,
      last_accessed_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error('新規ユーザー作成エラー:', insertError);
    } else {
      console.log('新規ユーザーを作成しました');
    }
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-line-signature') ?? '';

  if (!verifySignature(rawBody, signature)) {
    console.error('署名が不正です');
    return new NextResponse('署名が不正です', { status: 401 });
  }

  const body = JSON.parse(rawBody);
  console.log(`[LINE Webhook] 受信イベント数:`, body.events?.length || 0);

  for (const event of body.events) {
    const eventType = event.type;
    switch (eventType) {
      case 'message': {
        // メッセージイベント（テキスト・画像・動画・音声・ファイル・位置情報・スタンプ）
        const userId = event.source?.userId;
        if (!userId) {
          console.log('eventにuserIdがありません');
          continue;
        }
        console.log(`userId: ${userId} のイベントを処理中`);
        try {
          // LINEプロフィール取得
          const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
          });
          if (!profileRes.ok) {
            console.error(`プロフィール取得失敗: ${profileRes.status} ${profileRes.statusText}`);
            continue;
          }
          const profile = await profileRes.json();
          const name = profile.displayName || 'Unknown User';
          const profileImageUrl = profile.pictureUrl || null;
          // ユーザー作成・更新処理を呼び出し
          await upsertUserFromProfile(userId, name, profileImageUrl);
          for (const handler of messageReplyHandlers) {
            const handled = await handler({
              replyToken: event.replyToken,
              userMessage: event.message?.text || '',
              LINE_CHANNEL_ACCESS_TOKEN,
              userId,
            });
            if (handled) return NextResponse.json({ status: 'ok' });
          }
        } catch (error) {
          console.error(`ユーザー${userId}のイベント処理中にエラー:`, error);
        }
        break;
      }
      case 'unsend': {
        // 送信取消イベント
        break;
      }
      case 'follow': {
        // フォローイベント（友だち追加・ブロック解除）
        const followUserId = event.source?.userId;
        if (!followUserId) break;
        try {
          // LINEプロフィール取得
          const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${followUserId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
          });
          if (!profileRes.ok) {
            console.error(`プロフィール取得失敗: ${profileRes.status} ${profileRes.statusText}`);
            break;
          }
          const profile = await profileRes.json();
          const name = profile.displayName || 'Unknown User';
          const profileImageUrl = profile.pictureUrl || null;
          // ユーザー作成・更新処理を呼び出し
          await upsertUserFromProfile(followUserId, name, profileImageUrl);
          // デフォルトリッチメニューを設定
          try {
            await setupRichMenu1ForUser(followUserId, LINE_CHANNEL_ACCESS_TOKEN);
          } catch (err) {
            console.error('デフォルトリッチメニュー設定エラー:', err);
          }
          const welcomeMessage = {
            to: followUserId,
            messages: [
              {
                type: 'text',
                text: '友だち追加ありがとうございます！\nチャットをお楽しみください。',
              },
            ],
          };
          await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(welcomeMessage),
          });
        } catch (error) {
          console.error(`友だち追加イベント処理中にエラー:`, error);
        }
        break;
      }
      case 'unfollow': {
        // フォロー解除イベント（ブロック）
        break;
      }
      case 'join': {
        // 参加イベント（グループ・複数人トーク参加）
        break;
      }
      case 'leave': {
        // 退出イベント（グループ・複数人トーク退出）
        break;
      }
      case 'memberJoined': {
        // メンバー参加イベント
        break;
      }
      case 'memberLeft': {
        // メンバー退出イベント
        break;
      }
      case 'postback': {
        // ポストバックイベント
        break;
      }
      case 'videoPlayComplete': {
        // 動画視聴完了イベント
        break;
      }
      case 'beacon': {
        // ビーコンイベント
        break;
      }
      case 'accountLink': {
        // アカウント連携イベント
        break;
      }
      case 'membership': {
        // メンバーシップイベント
        break;
      }
      default: {
        // 未対応イベント
        break;
      }
    }
  }

  return NextResponse.json({ status: 'ok' });
}
