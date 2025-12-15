-- =========================================================
-- Add conversation status columns to customers table
-- RLS is disabled
-- =========================================================

BEGIN;

-- 1) Add columns to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS has_unreplied_messages BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_admin_reply_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_customer_message_at TIMESTAMPTZ;

-- 2) Create indexes for performance
CREATE INDEX IF NOT EXISTS customers_has_unreplied_messages_idx 
ON public.customers(has_unreplied_messages) 
WHERE has_unreplied_messages = true;

CREATE INDEX IF NOT EXISTS customers_last_customer_message_at_idx 
ON public.customers(last_customer_message_at DESC);

-- 3) Migrate existing data
-- Calculate last_customer_message_at from question_messages
UPDATE public.customers c
SET 
  last_customer_message_at = (
    SELECT MAX(qm.created_at)
    FROM public.question_messages qm
    JOIN public.questions q ON qm.question_id = q.id
    WHERE q.customer_id = c.id
    AND qm.sender_type = 'customer'
  )
WHERE EXISTS (
  SELECT 1
  FROM public.question_messages qm
  JOIN public.questions q ON qm.question_id = q.id
  WHERE q.customer_id = c.id
  AND qm.sender_type = 'customer'
);

-- Calculate last_admin_reply_at from question_messages
UPDATE public.customers c
SET 
  last_admin_reply_at = (
    SELECT MAX(qm.created_at)
    FROM public.question_messages qm
    JOIN public.questions q ON qm.question_id = q.id
    WHERE q.customer_id = c.id
    AND qm.sender_type = 'admin'
  )
WHERE EXISTS (
  SELECT 1
  FROM public.question_messages qm
  JOIN public.questions q ON qm.question_id = q.id
  WHERE q.customer_id = c.id
  AND qm.sender_type = 'admin'
);

-- Calculate has_unreplied_messages
-- If last_customer_message_at > last_admin_reply_at, then has_unreplied_messages = true
UPDATE public.customers c
SET 
  has_unreplied_messages = (
    CASE 
      WHEN c.last_customer_message_at IS NULL THEN false
      WHEN c.last_admin_reply_at IS NULL THEN true
      WHEN c.last_customer_message_at > c.last_admin_reply_at THEN true
      ELSE false
    END
  );

COMMIT;

