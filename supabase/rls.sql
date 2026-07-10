-- Row Level Security for List for Two.
--
-- With passcode auth, the browser reaches Supabase using the public anon key.
-- These policies make the data tables serve rows ONLY to a request that carries
-- a valid authenticated session — i.e. someone who passed the passcode gate via
-- the verify-passcode Edge Function. Anyone hitting the API with just the anon
-- key (role = 'anon') gets nothing.
--
-- Run this once in the Supabase dashboard: SQL Editor → paste → Run.

-- 1. Turn RLS on. Once enabled, every access is denied unless a policy allows it.
alter table public.bucket_items   enable row level security;
alter table public.gallery_images enable row level security;
alter table public.app_settings   enable row level security;
alter table public.milestones     enable row level security;

-- 2. Allow full read/write to any authenticated session.
--    (Both partners share one hidden account, so "authenticated" == "unlocked".)

-- bucket_items
drop policy if exists "authenticated full access" on public.bucket_items;
create policy "authenticated full access"
  on public.bucket_items
  for all
  to authenticated
  using (true)
  with check (true);

-- gallery_images
drop policy if exists "authenticated full access" on public.gallery_images;
create policy "authenticated full access"
  on public.gallery_images
  for all
  to authenticated
  using (true)
  with check (true);

-- app_settings
drop policy if exists "authenticated full access" on public.app_settings;
create policy "authenticated full access"
  on public.app_settings
  for all
  to authenticated
  using (true)
  with check (true);

-- milestones
drop policy if exists "authenticated full access" on public.milestones;
create policy "authenticated full access"
  on public.milestones
  for all
  to authenticated
  using (true)
  with check (true);
