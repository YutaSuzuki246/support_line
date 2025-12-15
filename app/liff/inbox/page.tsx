'use client';

import { useEffect, useState } from 'react';
import { initLiff, isLoggedIn, getProfile, getIDToken } from '@/lib/liffClient';
import { Heading1 } from '@/components/ui/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

type Profile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

type Conversation = {
  customer: {
    id: string;
    name: string | null;
    line_user_id: string;
    profile_image_url: string | null;
    has_unreplied_messages: boolean | null;
    last_admin_reply_at: string | null;
    last_customer_message_at: string | null;
  };
  latest_message: {
    content_text: string | null;
    created_at: string;
    sender_type: string;
  } | null;
  unreplied_count: number;
  unreplied_questions: Array<{
    id: string;
    content_text: string | null;
    created_at: string;
    status: string;
  }>;
  last_replied_at: string | null;
};

export default function InboxPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false); // 全ての会話を表示するか

  useEffect(() => {
    const init = async () => {
      try {
        await initLiff();
        setIsInitialized(true);
        const loggedIn = isLoggedIn();
        setIsAuthenticated(loggedIn);

        if (loggedIn) {
          // プロフィール情報を取得
          try {
            const profileData = await getProfile();
            setProfile(profileData);
            
            // IDトークンを取得
            const token = getIDToken();
            if (token) {
              setIdToken(token);
              // 会話一覧を取得
              await fetchConversations(token, showAll);
            }
          } catch (profileError) {
            console.error('プロフィール取得エラー:', profileError);
            setError('プロフィールの取得に失敗しました');
          }
        }
      } catch (error) {
        console.error('LIFF初期化エラー:', error);
        setError('LIFFの初期化に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchConversations = async (token: string, showAllConversations = false) => {
    try {
      setLoading(true);
      const url = showAllConversations 
        ? '/api/conversations?has_unreplied=false'
        : '/api/conversations?has_unreplied=true';
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('会話取得エラー:', err);
      setError('会話の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShowAll = async () => {
    if (idToken) {
      const newShowAll = !showAll;
      setShowAll(newShowAll);
      await fetchConversations(idToken, newShowAll);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    return `${diffDays}日前`;
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <Heading1 className="mb-4 text-red-600">エラー</Heading1>
            <p className="mb-4 text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <Heading1 className="mb-4">ログインが必要です</Heading1>
            <p className="mb-4 text-gray-600">LINEでログインしてください。</p>
            <Button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).liff) {
                  (window as any).liff.login();
                }
              }}
            >
              ログイン
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Heading1>{showAll ? '全ての会話' : '未返信一覧'}</Heading1>
            <Button
              variant="outline"
              onClick={handleToggleShowAll}
              className="text-sm"
            >
              {showAll ? '未返信のみ' : '全て表示'}
            </Button>
          </div>
          {profile?.displayName && (
            <p className="text-gray-600">ようこそ、{profile.displayName}さん</p>
          )}
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        <Card className="p-6">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {showAll ? '会話がありません' : '未返信の会話はありません'}
              </p>
              <p className="text-sm text-gray-500">質問が届くとここに表示されます</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.customer.id}
                  href={`/liff/conversation/${conversation.customer.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* アバター */}
                    <div className="flex-shrink-0">
                      {conversation.customer.profile_image_url ? (
                        <img
                          src={conversation.customer.profile_image_url}
                          alt={conversation.customer.name || ''}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">
                            {conversation.customer.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 truncate">
                          {conversation.customer.name || '名前不明'}
                        </span>
                        {conversation.customer.has_unreplied_messages && (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 ml-2 flex-shrink-0">
                            未返信
                          </span>
                        )}
                      </div>
                      {conversation.latest_message && (
                        <>
                          <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                            {conversation.latest_message.content_text || '（テキストなし）'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {conversation.customer.last_customer_message_at && (
                              <span>{formatTimeAgo(conversation.customer.last_customer_message_at)}</span>
                            )}
                            {conversation.customer.last_admin_reply_at && (
                              <>
                                <span>•</span>
                                <span>最終返信: {formatTimeAgo(conversation.customer.last_admin_reply_at)}</span>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

