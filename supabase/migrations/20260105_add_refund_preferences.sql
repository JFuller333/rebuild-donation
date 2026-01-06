-- Refund preferences per user/product
create table if not exists public.refund_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email text,
  shopify_product_handle text not null,
  preference text not null check (preference in ('refund', 'reallocate')),
  acknowledged_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for lookups
create index if not exists idx_refund_preferences_user_id on public.refund_preferences(user_id);
create index if not exists idx_refund_preferences_handle on public.refund_preferences(shopify_product_handle);

-- RLS
alter table public.refund_preferences enable row level security;

drop policy if exists "refund preferences select own" on public.refund_preferences;
create policy "refund preferences select own"
  on public.refund_preferences
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or email = coalesce(current_setting('request.jwt.claims', true)::json->>'email', '')
  );

drop policy if exists "refund preferences insert own" on public.refund_preferences;
create policy "refund preferences insert own"
  on public.refund_preferences
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    or user_id is null
  );

drop policy if exists "refund preferences update own" on public.refund_preferences;
create policy "refund preferences update own"
  on public.refund_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

