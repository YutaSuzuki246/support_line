-- =========================================================
-- Remove status column from customers table (if already added)
-- status is managed by has_unreplied_messages, so it's not needed
-- RLS is disabled
-- =========================================================

BEGIN;

-- Drop status column and its index if they exist
DROP INDEX IF EXISTS public.customers_status_idx;
ALTER TABLE public.customers DROP COLUMN IF EXISTS status;

COMMIT;

