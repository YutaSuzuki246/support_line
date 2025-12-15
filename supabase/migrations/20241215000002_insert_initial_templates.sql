-- Insert initial templates for MVP
-- Note: created_by will be set to NULL initially, update after admin user is created

-- 一般的な返信テンプレ
INSERT INTO public.templates (category, title, content, variables, check_list, notes, is_pinned) VALUES
(
  'その他',
  '確認中',
  'ご質問ありがとうございます。\n内容を確認して、後ほど改めてご返信いたします。\n今しばらくお待ちください。',
  '[]'::jsonb,
  '[]'::jsonb,
  '一次返信として使用',
  true
),
(
  'その他',
  '解決済み確認',
  'ご質問いただいた件について、解決いたしましたでしょうか？\n何かご不明点がございましたら、お気軽にお声がけください。',
  '[]'::jsonb,
  '[]'::jsonb,
  'フォローアップ用',
  false
);

-- 課題関連
INSERT INTO public.templates (category, title, content, variables, check_list, notes, is_pinned) VALUES
(
  '課題',
  '提出期限延長',
  '{name}さん\n\n課題の提出期限についてご相談いただき、ありがとうございます。\n提出期限を{new_deadline}まで延長いたします。\n期限までに提出をお願いいたします。',
  '["name", "new_deadline"]'::jsonb,
  '["延長理由を確認", "新しい期限を確認"]'::jsonb,
  '期限延長時のみ使用',
  false
),
(
  '課題',
  '提出物確認',
  '{name}さん\n\n課題の提出ありがとうございます。\n内容を確認いたしますので、しばらくお待ちください。\nフィードバックは{feedback_date}までにお送りします。',
  '["name", "feedback_date"]'::jsonb,
  '["提出物の確認", "フィードバック予定日を確認"]'::jsonb,
  '提出受領確認',
  true
);

-- 技術質問関連
INSERT INTO public.templates (category, title, content, variables, check_list, notes, is_pinned) VALUES
(
  '技術質問',
  '資料案内',
  '{name}さん\n\nご質問ありがとうございます。\nこちらの内容については、以下の資料をご確認ください。\n{document_url}\nご不明点がございましたら、お気軽にお声がけください。',
  '["name", "document_url"]'::jsonb,
  '["適切な資料を確認", "URLが正しいか確認"]'::jsonb,
  '資料案内用',
  true
),
(
  '技術質問',
  '講師に確認',
  '{name}さん\n\nご質問ありがとうございます。\nこちらの内容については、講師に確認いたしますので、\n後ほど改めてご返信いたします。\n今しばらくお待ちください。',
  '["name"]'::jsonb,
  '["質問内容を正確に理解", "講師に伝えるべきポイントを整理"]'::jsonb,
  'エスカレーション時の一次返信',
  true
);

-- 事務連絡
INSERT INTO public.templates (category, title, content, variables, check_list, notes, is_pinned) VALUES
(
  '事務連絡',
  '入金確認',
  '{name}さん\n\nお問い合わせありがとうございます。\n入金の確認ができ次第、ご連絡いたします。\n通常、入金確認には{confirmation_days}営業日かかります。',
  '["name", "confirmation_days"]'::jsonb,
  '["入金情報を確認", "確認日数を確認"]'::jsonb,
  '入金確認用',
  false
);

