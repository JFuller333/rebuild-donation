-- Allow anonymous inserts for refund preferences (pre-checkout) while keeping ownership for updates

-- Recreate policies to include anon for inserts
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
  to authenticated, anon
  with check (
    user_id is null
    or auth.uid() = user_id
  );

drop policy if exists "refund preferences update own" on public.refund_preferences;
create policy "refund preferences update own"
  on public.refund_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

