-- Add role column to users table (for staff/teacher/admin distinction)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff' CHECK (role IN ('staff', 'teacher', 'admin'));

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  line_message_id TEXT, -- LINEのmessageId（コンテンツ取得用）
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'file', 'sticker', 'video', 'audio')), -- text/image/file/sticker
  content_text TEXT, -- textの場合は本文
  content_url TEXT, -- 添付がある場合のURL
  category TEXT CHECK (category IN ('課題', '技術質問', '事務連絡', '受講ルール', '添削依頼', '不具合', 'その他')), -- カテゴリ
  difficulty TEXT CHECK (difficulty IN ('staff_can_reply', 'unsure', 'teacher_required')), -- 難易度
  status TEXT NOT NULL DEFAULT 'unreplied' CHECK (status IN ('unreplied', 'replying', 'replied', 'on_hold', 'escalated')),
  lock_version INTEGER NOT NULL DEFAULT 0, -- 楽観ロック用
  assigned_to UUID REFERENCES public.users(id), -- 担当者
  sla_deadline TIMESTAMP WITH TIME ZONE, -- SLA期限
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT questions_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS questions_customer_id_idx ON public.questions(customer_id);
CREATE INDEX IF NOT EXISTS questions_status_idx ON public.questions(status);
CREATE INDEX IF NOT EXISTS questions_assigned_to_idx ON public.questions(assigned_to);
CREATE INDEX IF NOT EXISTS questions_created_at_idx ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS questions_category_idx ON public.questions(category) WHERE category IS NOT NULL;

-- Create templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('課題', '技術質問', '事務連絡', '受講ルール', '添削依頼', '不具合', 'その他')), -- カテゴリ
  title TEXT NOT NULL, -- テンプレタイトル
  content TEXT NOT NULL, -- テンプレ本文（変数含む）
  variables JSONB DEFAULT '[]'::jsonb, -- 使用可能な変数一覧
  check_list JSONB DEFAULT '[]'::jsonb, -- 確認事項チェックリスト
  notes TEXT, -- 注意事項
  is_pinned BOOLEAN DEFAULT false, -- ピン留め
  is_active BOOLEAN DEFAULT true, -- 有効/無効
  requires_approval BOOLEAN DEFAULT false, -- 講師承認が必要か
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT templates_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS templates_category_idx ON public.templates(category);
CREATE INDEX IF NOT EXISTS templates_is_active_idx ON public.templates(is_active);

-- Create replies table
CREATE TABLE IF NOT EXISTS public.replies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES public.users(id), -- 返信者
  template_id UUID REFERENCES public.templates(id), -- 使用したテンプレ
  reply_text TEXT NOT NULL, -- 送信した本文
  original_template_text TEXT, -- テンプレ原文（編集前）
  send_result TEXT NOT NULL DEFAULT 'pending' CHECK (send_result IN ('pending', 'success', 'fail')),
  error_message TEXT, -- 失敗時のエラーメッセージ
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT replies_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS replies_question_id_idx ON public.replies(question_id);
CREATE INDEX IF NOT EXISTS replies_admin_user_id_idx ON public.replies(admin_user_id);
CREATE INDEX IF NOT EXISTS replies_send_result_idx ON public.replies(send_result);

-- Create escalations table
CREATE TABLE IF NOT EXISTS public.escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  escalated_by UUID NOT NULL REFERENCES public.users(id), -- エスカレーションした人
  escalated_to UUID REFERENCES public.users(id), -- 講師（担当者）
  reason TEXT NOT NULL, -- 理由
  staff_summary TEXT, -- スタッフの要約
  points TEXT, -- 論点
  missing_info TEXT, -- 不足情報
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  first_reply_sent BOOLEAN DEFAULT false, -- 一次返信（確認中テンプレ）を送信したか
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  resolved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT escalations_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS escalations_question_id_idx ON public.escalations(question_id);
CREATE INDEX IF NOT EXISTS escalations_status_idx ON public.escalations(status);
CREATE INDEX IF NOT EXISTS escalations_escalated_to_idx ON public.escalations(escalated_to) WHERE escalated_to IS NOT NULL;

-- Create question_notes table (内部メモ)
CREATE TABLE IF NOT EXISTS public.question_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id), -- メモ作成者
  note_text TEXT NOT NULL, -- メモ内容
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT question_notes_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS question_notes_question_id_idx ON public.question_notes(question_id);
CREATE INDEX IF NOT EXISTS question_notes_created_at_idx ON public.question_notes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role can do everything)
CREATE POLICY "Enable all access for service role" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for service role" ON public.templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for service role" ON public.replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for service role" ON public.escalations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for service role" ON public.question_notes FOR ALL USING (true) WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (now() AT TIME ZONE 'utc');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

