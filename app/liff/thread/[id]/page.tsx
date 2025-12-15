'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { initLiff, isLoggedIn, getProfile, getIDToken } from '@/lib/liffClient';
import { Heading1, Heading2 } from '@/components/ui/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextArea } from '@/components/ui/TextArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

type Question = {
  id: string;
  customer_id: string;
  content_text: string | null;
  status: string;
  created_at: string;
  customer?: {
    name: string | null;
    line_user_id: string;
  };
};

type Template = {
  id: string;
  title: string;
  content: string;
  category: string;
};

type QuestionMessage = {
  id: string;
  content_text: string | null;
  sender_type: string;
  created_at: string;
  customer?: {
    name: string | null;
  };
  admin_user?: {
    name: string | null;
  };
};

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [messages, setMessages] = useState<QuestionMessage[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initLiff();
        setIsInitialized(true);
        const loggedIn = isLoggedIn();
        setIsAuthenticated(loggedIn);

        if (loggedIn) {
          const token = getIDToken();
          if (token) {
            setIdToken(token);
            await Promise.all([
              fetchQuestion(token),
              fetchTemplates(token),
            ]);
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
  }, [questionId]);

  const fetchQuestion = async (token: string) => {
    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch question');
      }

      const data = await res.json();
      setQuestion(data.question);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('質問取得エラー:', err);
      setError('質問の取得に失敗しました');
    }
  };

  const fetchTemplates = async (token: string) => {
    try {
      const res = await fetch('/api/templates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('テンプレ取得エラー:', err);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      // TODO: 変数の自動差し込み（{name}など）
      setReplyText(template.content);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !idToken) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
      const res = await fetch(`/api/questions/${questionId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          replyText,
          templateId: selectedTemplateId || null,
          originalTemplateText: selectedTemplate?.content || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send reply');
      }

      // 成功時は一覧に戻る
      router.push('/liff/inbox');
    } catch (err: any) {
      console.error('返信送信エラー:', err);
      setError(err.message || '返信の送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>読み込み中...</p>
        </div>
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

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <p className="text-gray-600">質問が見つかりません</p>
            <Button onClick={() => router.push('/liff/inbox')} className="mt-4">
              一覧に戻る
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
          <Button
            variant="outline"
            onClick={() => router.push('/liff/inbox')}
            className="mb-4"
          >
            ← 一覧に戻る
          </Button>
          <Heading1 className="mb-2">質問詳細</Heading1>
          {question.customer?.name && (
            <p className="text-gray-600">受講生: {question.customer.name}</p>
          )}
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* 左側: 質問履歴 */}
          <Card className="p-6">
            <Heading2 className="mb-4">質問内容</Heading2>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 ${
                    message.sender_type === 'customer'
                      ? 'bg-blue-50'
                      : 'bg-green-50 ml-auto'
                  }`}
                >
                  <div className="mb-1 text-xs text-gray-500">
                    {message.sender_type === 'customer'
                      ? message.customer?.name || '受講生'
                      : message.admin_user?.name || '運営'}
                  </div>
                  <div className="text-sm text-gray-900">
                    {message.content_text || '（テキストなし）'}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {new Date(message.created_at).toLocaleString('ja-JP')}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 右側: 返信エディタ */}
          <Card className="p-6">
            <Heading2 className="mb-4">返信</Heading2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  テンプレート
                </label>
                <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="テンプレートを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  返信本文
                </label>
                <TextArea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="返信内容を入力してください"
                  rows={8}
                />
              </div>

              <Button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
                className="w-full"
              >
                {sending ? '送信中...' : '返信を送信'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

