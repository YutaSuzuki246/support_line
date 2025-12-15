-- Create customers table for LINE account 2
create table if not exists public.customers (
  id uuid not null default gen_random_uuid (),
  line_user_id text not null,
  name text null,
  profile_image_url text null,
  created_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  last_accessed_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint customers_pkey primary key (id),
  constraint customers_line_user_id_key unique (line_user_id)
) TABLESPACE pg_default;

-- Enable Row Level Security
alter table public.customers enable row level security;

-- Create index on line_user_id for faster lookups
create index if not exists customers_line_user_id_idx on public.customers (line_user_id);

-- Create index on last_accessed_at for analytics queries
create index if not exists customers_last_accessed_at_idx on public.customers (last_accessed_at desc);

-- RLS Policies (optional - adjust based on your security requirements)
-- Allow service role to manage all customer data
create policy "Enable read access for service role"
  on public.customers
  for select
  using (true);

create policy "Enable insert access for service role"
  on public.customers
  for insert
  with check (true);

create policy "Enable update access for service role"
  on public.customers
  for update
  using (true);

create policy "Enable delete access for service role"
  on public.customers
  for delete
  using (true);

