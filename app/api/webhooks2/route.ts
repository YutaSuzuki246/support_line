import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getCustomerByLineUserId,
  createCustomer,
  updateCustomerByLineUserId,
  updateLastAccessedCustomer,
  updateCustomerOnMessage,
} from '@/lib/db/customers';
import { createQuestion } from '@/lib/db/questions';
import { createQuestionMessage } from '@/lib/db/questionMessages';
import { handleSampleReply } from '@/components/line/SampleReply';
import { promises as fs } from 'fs';
import path from 'path';
import { setupRichMenu1ForUser } from '@/components/line/SampleRichMenu';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN2;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET2;

if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_CHANNEL_SECRET) {
  console.error('[Webhook2] 環境変数が設定されていません');
  console.error('[Webhook2] LINE_CHANNEL_ACCESS_TOKEN2:', LINE_CHANNEL_ACCESS_TOKEN ? '設定済み' : '未設定');
  console.error('[Webhook2] LINE_CHANNEL_SECRET2:', LINE_CHANNEL_SECRET ? '設定済み' : '未設定');
}

export const runtime = 'nodejs'; // Node.jsランタイムを指定（Edgeでは不可）

// 署名検証（セキュリティ）
function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) {
    console.error('[Webhook2] LINE_CHANNEL_SECRET2が設定されていません');
    return false;
  }
  
  const hash = crypto
    .createHmac('SHA256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  
  const isValid = hash === signature;
  
  if (!isValid) {
    console.error('[Webhook2] 署名検証失敗');
    console.error('[Webhook2] 期待されるハッシュ:', hash);
    console.error('[Webhook2] 受信したハッシュ:', signature);
    console.error('[Webhook2] ボディの長さ:', body.length);
    console.error('[Webhook2] ボディの最初の100文字:', body.substring(0, 100));
  }
  
  return isValid;
}

// 今後の拡張用: 応答ハンドラー配列
const messageReplyHandlers = [
  handleSampleReply,
  // ここに他のハンドラーを追加可能
];

// カスタマー作成・更新処理を関数化
async function upsertCustomerFromProfile(userId: string, name: string, profileImageUrl: string | null) {
  // 既存カスタマーの確認
  const { data: existingCustomer, error: selectError } = await getCustomerByLineUserId(userId);
  if (selectError && selectError.code !== 'PGRST116') {
    console.error('既存カスタマー確認エラー:', selectError);
    return null;
  }
  if (existingCustomer) {
    // 既存カスタマー：最終アクセス情報を更新
    console.log('既存カスタマーを更新中...');
    const { data: updatedCustomer, error: updateError } = await updateCustomerByLineUserId(userId, {
      name: name,
      profile_image_url: profileImageUrl,
      last_accessed_at: new Date().toISOString(),
    });
    if (updateError) {
      console.error('カスタマー更新エラー:', updateError);
      return existingCustomer; // エラーでも既存データを返す
    } else {
      console.log('カスタマー情報を更新しました');
      return updatedCustomer || existingCustomer;
    }
  } else {
    // 新規カスタマー：登録
    console.log('新規カスタマーを作成中...');
    const { data: newCustomer, error: insertError } = await createCustomer({
      line_user_id: userId,
      name: name,
      profile_image_url: profileImageUrl,
      last_accessed_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error('新規カスタマー作成エラー:', insertError);
      return null;
    } else {
      console.log('新規カスタマーを作成しました');
      return newCustomer;
    }
  }
}

export async function POST(req: NextRequest) {
  // 環境変数の確認
  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_CHANNEL_SECRET) {
    console.error('[Webhook2] 環境変数が設定されていません');
    console.error('[Webhook2] LINE_CHANNEL_ACCESS_TOKEN2:', LINE_CHANNEL_ACCESS_TOKEN ? '設定済み' : '未設定');
    console.error('[Webhook2] LINE_CHANNEL_SECRET2:', LINE_CHANNEL_SECRET ? '設定済み' : '未設定');
    return new NextResponse('環境変数が設定されていません', { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-line-signature') ?? '';

  console.log('[Webhook2] 受信した署名:', signature ? 'あり' : 'なし');
  console.log('[Webhook2] ボディのサイズ:', rawBody.length);

  if (!verifySignature(rawBody, signature)) {
    console.error('[Webhook2] 署名が不正です');
    return new NextResponse('署名が不正です', { status: 401 });
  }

  const body = JSON.parse(rawBody);
  console.log(`[LINE Webhook2] 受信イベント数:`, body.events?.length || 0);

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
          const name = profile.displayName || 'Unknown Customer';
          const profileImageUrl = profile.pictureUrl || null;
          // カスタマー作成・更新処理を呼び出し
          const customer = await upsertCustomerFromProfile(userId, name, profileImageUrl);
          if (!customer) {
            console.error('カスタマーの作成・更新に失敗しました');
            continue;
          }

          // メッセージタイプに応じて質問チケットを作成
          const message = event.message;
          if (message) {
            let contentType = 'text';
            let contentText = '';
            let lineMessageId = message.id || '';

            if (message.type === 'text') {
              contentType = 'text';
              contentText = message.text || '';
            } else if (message.type === 'image') {
              contentType = 'image';
              lineMessageId = message.id || '';
              // TODO: 画像の場合は後でコンテンツ取得APIを呼び出してStorageに保存
            } else if (message.type === 'file') {
              contentType = 'file';
              lineMessageId = message.id || '';
            } else {
              // その他のメッセージタイプはスキップ（または適切に処理）
              console.log('未対応のメッセージタイプ:', message.type);
              continue;
            }

            // 質問チケットを作成
            const { data: question, error: questionError } = await createQuestion({
              customer_id: customer.id,
              line_message_id: lineMessageId,
              content_type: contentType,
              content_text: contentText,
              status: 'unreplied',
            });

            if (questionError) {
              console.error('質問チケット作成エラー:', questionError);
            } else if (question) {
              console.log('質問チケットを作成しました:', question.id);

              // question_messagesにも保存
              const { error: messageError } = await createQuestionMessage({
                question_id: question.id,
                line_message_id: lineMessageId,
                content_type: contentType,
                content_text: contentText,
                sender_type: 'customer',
                customer_id: customer.id,
                admin_user_id: null,
              });

              if (messageError) {
                console.error('質問メッセージ作成エラー:', messageError);
              } else {
                // customersテーブルを更新（最後のメッセージ時刻、未返信フラグ）
                await updateCustomerOnMessage(customer.id);
              }
            }
          }

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
          console.error(`カスタマー${userId}のイベント処理中にエラー:`, error);
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
          const name = profile.displayName || 'Unknown Customer';
          const profileImageUrl = profile.pictureUrl || null;
          // カスタマー作成・更新処理を呼び出し
          await upsertCustomerFromProfile(followUserId, name, profileImageUrl);
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

