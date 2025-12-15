-- Insert initial templates for MVP
-- Note: created_by will be set to NULL initially, update after admin user is created

-- デモ用テンプレート（3つのよく使う返信パターン）
-- Note: PostgreSQLではE'...'を使用してエスケープシーケンス（\n）を有効にする
INSERT INTO public.templates (category, title, content, variables, check_list, notes, is_pinned) VALUES
(
  'その他',
  '確認中',
  E'ご質問ありがとうございます。\n内容を確認して、後ほど改めてご返信いたします。\n今しばらくお待ちください。',
  '[]'::jsonb,
  '[]'::jsonb,
  '一次返信として使用',
  true
),
(
  'その他',
  'ご質問ありがとうございます',
  E'{name}さん\n\nご質問いただき、ありがとうございます。\n{answer_content}\n\nご不明点がございましたら、お気軽にお声がけください。',
  '["name", "answer_content"]'::jsonb,
  '["質問内容を理解", "適切な回答を準備"]'::jsonb,
  '汎用的な回答テンプレート',
  true
),
(
  '技術質問',
  '講師に確認',
  E'{name}さん\n\nご質問ありがとうございます。\nこちらの内容については、講師に確認いたしますので、\n後ほど改めてご返信いたします。\n今しばらくお待ちください。',
  '["name"]'::jsonb,
  '["質問内容を正確に理解", "講師に伝えるべきポイントを整理"]'::jsonb,
  'エスカレーション時の一次返信',
  true
);
