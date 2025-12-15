'use client';

import { useEffect, useState } from 'react';
import { initLiff, isLoggedIn, getProfile } from '@/lib/liffClient';
import { Heading1 } from '@/components/ui/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type Profile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

export default function InboxPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          } catch (profileError) {
            console.error('プロフィール取得エラー:', profileError);
            setError('プロフィールの取得に失敗しました');
          }
        }
      } catch (error) {
        console.error('LIFF初期化エラー:', error);
        setError('LIFFの初期化に失敗しました');
      }
    };

    init();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Heading1 className="mb-2">未返信一覧</Heading1>
          {profile?.displayName && (
            <p className="text-gray-600">ようこそ、{profile.displayName}さん</p>
          )}
        </div>

        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">未返信の質問はありません</p>
            <p className="text-sm text-gray-500">質問が届くとここに表示されます</p>
          </div>

          {/* TODO: 未返信一覧の実装 */}
          {/* TODO: APIから質問データを取得して表示 */}
        </Card>
      </div>
    </div>
  );
}

