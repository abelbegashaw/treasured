-- Schema for List for Two.
-- Run this ONCE in the Supabase dashboard (SQL Editor) BEFORE rls.sql.
-- Column shapes mirror the row types the app reads/writes in
-- src/hooks/useBucketList.ts and src/hooks/useGallery.ts.

-- Bucket-list items
create table if not exists public.bucket_items (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null,
  is_completed boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- Gallery images (url points at the Cloudinary-hosted asset)
-- bucket_item_id optionally links a photo to a bucket item ("proof" of completion);
-- null = a standalone Gallery photo. Linked photos still appear in the main Gallery.
-- post_id groups images uploaded together into one carousel post (2–10 images);
-- position orders them within the post. Both null/0 for standalone single photos.
create table if not exists public.gallery_images (
  id             uuid        primary key default gen_random_uuid(),
  url            text        not null,
  caption        text        not null default 'Captured Moment',
  bucket_item_id uuid        references public.bucket_items(id) on delete set null,
  post_id        uuid,
  position       smallint    not null default 0,
  created_at     timestamptz not null default now()
);

-- App settings: a single row (id is pinned to 1) holding shared config.
-- anchor_date = the couple's "together since" date; the milestone timeline
-- auto-numbers its monthly markers from this date. Read/written in
-- src/hooks/useMilestones.ts.
create table if not exists public.app_settings (
  id          smallint    primary key default 1,
  anchor_date date,
  constraint app_settings_single_row check (id = 1)
);
insert into public.app_settings (id) values (1) on conflict do nothing;

-- Milestones: one optional record per monthly-anniversary marker. month_number
-- counts whole months from anchor_date (0 = the beginning, 1 = one month, …)
-- and is unique so each month holds at most one photo + note. url points at the
-- Cloudinary-hosted asset. Read/written in src/hooks/useMilestones.ts.
create table if not exists public.milestones (
  id           uuid        primary key default gen_random_uuid(),
  month_number smallint    not null unique,
  url          text        not null,
  note         text        not null default '',
  created_at   timestamptz not null default now()
);
