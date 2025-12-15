-- Create question_messages table for conversation history
CREATE TABLE IF NOT EXISTS public.question_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  line_message_id TEXT NOT NULL, -- LINEのmessageId
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'file', 'sticker', 'video', 'audio')),
  content_text TEXT, -- textの場合は本文
  content_url TEXT, -- Storage署名URL（添付がある場合）
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')), -- 送信者種別
  sender_id UUID, -- customer_id または user_id（型はUUIDだが、実際はcustomer_idまたはuser_id）
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  CONSTRAINT question_messages_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS question_messages_question_id_idx ON public.question_messages(question_id);
CREATE INDEX IF NOT EXISTS question_messages_created_at_idx ON public.question_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS question_messages_sender_type_idx ON public.question_messages(sender_type);

-- Enable Row Level Security
ALTER TABLE public.question_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Enable all access for service role" ON public.question_messages FOR ALL USING (true) WITH CHECK (true);

