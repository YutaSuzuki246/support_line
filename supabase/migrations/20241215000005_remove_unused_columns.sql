-- =========================================================
-- Remove unused columns from question_messages table
-- RLS is disabled
-- =========================================================

BEGIN;

-- Remove sender_id column from question_messages table
-- This column is not used because customer_id and admin_user_id are used instead
ALTER TABLE public.question_messages
DROP COLUMN IF EXISTS sender_id;

COMMIT;

