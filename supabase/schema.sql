-- Run in the Supabase SQL editor before enabling cloud synchronization.
-- This schema is intentionally user-scoped: a browser anon key alone cannot
-- read or write workshop data.

create table if not exists public.veri_kutusu (
  owner_id uuid not null references auth.users(id) on delete cascade,
  anahtar text not null,
  deger jsonb not null,
  guncelleme_zamani timestamptz not null default now(),
  primary key (owner_id, anahtar)
);

alter table public.veri_kutusu enable row level security;

drop policy if exists "users read their own workshop data" on public.veri_kutusu;
create policy "users read their own workshop data"
on public.veri_kutusu for select to authenticated
using (owner_id = auth.uid());

drop policy if exists "users insert their own workshop data" on public.veri_kutusu;
create policy "users insert their own workshop data"
on public.veri_kutusu for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "users update their own workshop data" on public.veri_kutusu;
create policy "users update their own workshop data"
on public.veri_kutusu for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "users delete their own workshop data" on public.veri_kutusu;
create policy "users delete their own workshop data"
on public.veri_kutusu for delete to authenticated
using (owner_id = auth.uid());

-- The app uses Prefer: resolution=merge-duplicates, which relies on the
-- composite primary key above for safe upserts.
