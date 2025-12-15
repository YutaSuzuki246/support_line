'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { initLiff, isLoggedIn, getProfile, getIDToken } from '@/lib/liffClient';
import { Heading1 } from '@/components/ui/typography';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

type Customer = {
  id: string;
  name: string | null;
  line_user_id: string;
  profile_image_url: string | null;
  has_unreplied_messages: boolean | null;
  last_admin_reply_at: string | null;
  last_customer_message_at: string | null;
};

type Message = {
  id: string;
  content_text: string | null;
  content_type: string;
  sender_type: string;
  created_at: string;
  customer?: Customer | null;
  admin_user?: {
    id: string;
    name: string | null;
  } | null;
};

type Template = {
  id: string;
  title: string;
  content: string;
  category: string;
};

type ConversationData = {
  customer: Customer;
  messages: Message[];
  unreplied_questions: Array<{
    id: string;
    content_text: string | null;
    created_at: string;
    status: string;
  }>;
};

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
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
              fetchConversation(token),
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
  }, [customerId]);

  useEffect(() => {
    // メッセージが更新されたらスクロール
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const fetchConversation = async (token: string) => {
    try {
      const res = await fetch(`/api/conversations/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await res.json();
      setConversation(data);
    } catch (err) {
      console.error('会話取得エラー:', err);
      setError('会話の取得に失敗しました');
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
      const res = await fetch(`/api/conversations/${customerId}/reply`, {
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

      // 成功時は会話を再取得
      await fetchConversation(idToken);
      
      // フォームをクリア
      setReplyText('');
      setSelectedTemplateId('');
    } catch (err: any) {
      console.error('返信送信エラー:', err);
      setError(err.message || '返信の送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
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
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6">
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
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-center">
            <p className="text-gray-600">会話が見つかりません</p>
            <Button onClick={() => router.push('/liff/inbox')} className="mt-4">
              一覧に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* ヘッダー（固定） */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white p-4 sticky top-0 z-10">
        <Button
          variant="outline"
          onClick={() => router.push('/liff/inbox')}
          className="h-8 w-8 p-0"
        >
          ←
        </Button>
        {conversation.customer.profile_image_url ? (
          <img
            src={conversation.customer.profile_image_url}
            alt={conversation.customer.name || ''}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">
              {conversation.customer.name?.charAt(0) || '?'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {conversation.customer.name || '名前不明'}
          </p>
          <div className="flex flex-col gap-1">
            {conversation.customer.has_unreplied_messages ? (
              <p className="text-xs text-orange-600">未返信あり</p>
            ) : conversation.customer.last_admin_reply_at && (
              <p className="text-xs text-gray-500">
                最終返信: {formatTime(conversation.customer.last_admin_reply_at)}
              </p>
            )}
            {conversation.customer.last_customer_message_at && (
              <p className="text-xs text-gray-400">
                最新メッセージ: {formatTime(conversation.customer.last_customer_message_at)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_type === 'customer' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender_type === 'customer'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.content_text || '（テキストなし）'}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    message.sender_type === 'customer'
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 返信フォーム（固定） */}
      <div className="border-t border-gray-200 bg-white p-4 sticky bottom-0">
        <div className="mb-2">
          <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="テンプレートを選択" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <TextArea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="返信内容を入力してください"
            rows={3}
            className="flex-1 resize-none"
          />
          <Button
            onClick={handleSendReply}
            disabled={!replyText.trim() || sending}
            className="self-end"
          >
            {sending ? '送信中...' : '送信'}
          </Button>
        </div>
      </div>
    </div>
  );
}

