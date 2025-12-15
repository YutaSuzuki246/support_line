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
),
(
  '事務連絡',
  '手続き完了通知',
  '{name}さん\n\nお手続きが完了いたしました。\n{procedure_name}について、正常に処理いたしました。\nご確認のほど、よろしくお願いいたします。',
  '["name", "procedure_name"]'::jsonb,
  '["手続き内容を確認", "処理結果を確認"]'::jsonb,
  '手続き完了通知用',
  false
),
(
  '事務連絡',
  '書類送付案内',
  '{name}さん\n\nご請求いただいた書類を{send_date}に送付いたしました。\n到着まで{delivery_days}日程度かかります。\n到着後、ご確認ください。',
  '["name", "send_date", "delivery_days"]'::jsonb,
  '["送付日を確認", "配送日数を確認"]'::jsonb,
  '書類送付案内用',
  false
);

-- デモ用テンプレート（よく使う返信パターン）
INSERT INTO public.templates (category, title, content, variables, check_list, notes, is_pinned) VALUES
(
  'その他',
  'ご質問ありがとうございます',
  '{name}さん\n\nご質問いただき、ありがとうございます。\n{answer_content}\n\nご不明点がございましたら、お気軽にお声がけください。',
  '["name", "answer_content"]'::jsonb,
  '["質問内容を理解", "適切な回答を準備"]'::jsonb,
  '汎用的な回答テンプレート',
  true
),
(
  'その他',
  'お待たせして申し訳ございません',
  '{name}さん\n\nお待たせしてしまい、申し訳ございませんでした。\n{response_content}\n\n今後ともよろしくお願いいたします。',
  '["name", "response_content"]'::jsonb,
  '["対応内容を確認", "丁寧に説明"]'::jsonb,
  '謝罪を含む返信テンプレート',
  true
),
(
  '技術質問',
  'サンプルコード案内',
  '{name}さん\n\nご質問いただいた{technology_name}について、\n以下のサンプルコードをご確認ください。\n\n```\n{sample_code}\n```\n\nご不明点がございましたら、お気軽にお声がけください。',
  '["name", "technology_name", "sample_code"]'::jsonb,
  '["技術内容を確認", "サンプルコードを準備"]'::jsonb,
  '技術質問へのサンプルコード付き返信',
  false
),
(
  '技術質問',
  'ドキュメント案内',
  '{name}さん\n\nご質問いただいた内容について、\n公式ドキュメントに詳しい説明がございます。\n\n{document_url}\n\nこちらをご確認いただき、ご不明点がございましたらお知らせください。',
  '["name", "document_url"]'::jsonb,
  '["適切なドキュメントを確認", "URLが正しいか確認"]'::jsonb,
  'ドキュメント案内用',
  true
),
(
  '課題',
  'フィードバック送付',
  '{name}さん\n\n課題の提出ありがとうございます。\n添削が完了いたしましたので、フィードバックをお送りいたします。\n\n{feedback_summary}\n\n詳細は添付ファイルをご確認ください。',
  '["name", "feedback_summary"]'::jsonb,
  '["フィードバック内容を確認", "添付ファイルを準備"]'::jsonb,
  '課題フィードバック送付用',
  true
),
(
  '課題',
  '再提出依頼',
  '{name}さん\n\n課題の提出ありがとうございます。\n以下の点について、修正をお願いいたします。\n\n{correction_points}\n\n修正後、改めて提出をお願いいたします。',
  '["name", "correction_points"]'::jsonb,
  '["修正点を明確に", "丁寧に説明"]'::jsonb,
  '課題再提出依頼用',
  false
),
(
  '受講ルール',
  '受講ルール確認',
  '{name}さん\n\nご質問いただいた{rule_name}について、\n受講ルールに以下のように定められております。\n\n{rule_content}\n\nご不明点がございましたら、お気軽にお声がけください。',
  '["name", "rule_name", "rule_content"]'::jsonb,
  '["受講ルールを確認", "正確な情報を提供"]'::jsonb,
  '受講ルール確認用',
  false
),
(
  '不具合',
  '不具合報告受付',
  '{name}さん\n\n不具合のご報告ありがとうございます。\n報告いただいた内容を確認いたします。\n\n{issue_description}\n\n確認後、改めてご連絡いたします。',
  '["name", "issue_description"]'::jsonb,
  '["不具合内容を確認", "再現手順を確認"]'::jsonb,
  '不具合報告受付用',
  false
),
(
  '不具合',
  '不具合対応完了',
  '{name}さん\n\n報告いただいた不具合について、\n{fix_status}対応を完了いたしました。\n\n{fix_details}\n\nご確認いただき、引き続き問題がございましたらお知らせください。',
  '["name", "fix_status", "fix_details"]'::jsonb,
  '["対応内容を確認", "解決確認"]'::jsonb,
  '不具合対応完了通知用',
  false
),
(
  '添削依頼',
  '添削受付確認',
  '{name}さん\n\n添削依頼ありがとうございます。\n{assignment_name}について、添削を開始いたします。\n{review_duration}以内にフィードバックをお送りいたします。',
  '["name", "assignment_name", "review_duration"]'::jsonb,
  '["添削内容を確認", "期間を確認"]'::jsonb,
  '添削受付確認用',
  true
);

