-- =========================================================
-- Move assigned_to from questions to customers table
-- Note: status is managed by has_unreplied_messages, so we don't add status column
-- RLS is disabled
-- =========================================================

BEGIN;

-- 1) Add assigned_to column to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id);

-- 2) Create index for assigned_to
CREATE INDEX IF NOT EXISTS customers_assigned_to_idx 
ON public.customers(assigned_to) 
WHERE assigned_to IS NOT NULL;

-- 3) Migrate existing data (questionsテーブルの最新のassigned_toをcustomersに反映)
-- 各customerの最新のquestionのassigned_toを取得してcustomersテーブルを更新
UPDATE public.customers c
SET 
  assigned_to = (
    SELECT q.assigned_to
    FROM public.questions q
    WHERE q.customer_id = c.id
    ORDER BY q.created_at DESC
    LIMIT 1
  )
WHERE EXISTS (
  SELECT 1 FROM public.questions q 
  WHERE q.customer_id = c.id 
  AND q.assigned_to IS NOT NULL
);

-- 4) Drop columns from questions table
-- statusとassigned_toを削除（statusはhas_unreplied_messagesで管理）
ALTER TABLE public.questions
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS assigned_to,
DROP COLUMN IF EXISTS lock_version;

-- 5) Drop indexes that are no longer needed
DROP INDEX IF EXISTS public.questions_status_idx;
DROP INDEX IF EXISTS public.questions_assigned_to_idx;

COMMIT;

