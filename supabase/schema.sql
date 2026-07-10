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
-- media_type distinguishes photos from videos ('image' | 'video').
create table if not exists public.gallery_images (
  id             uuid        primary key default gen_random_uuid(),
  url            text        not null,
  caption        text        not null default 'Captured Moment',
  media_type     text        not null default 'image',
  bucket_item_id uuid        references public.bucket_items(id) on delete set null,
  post_id        uuid,
  position       smallint    not null default 0,
  created_at     timestamptz not null default now()
);
-- Idempotent upgrade for databases created before videos were supported.
alter table public.gallery_images add column if not exists media_type text not null default 'image';

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

-- Milestones: one group per monthly-anniversary marker. month_number counts
-- whole months from anchor_date (0 = the beginning, 1 = one month, …) and is
-- unique so each month is a single group holding a note + one or more media.
-- The media themselves live in milestone_media. Read/written in
-- src/hooks/useMilestones.ts.
create table if not exists public.milestones (
  id           uuid        primary key default gen_random_uuid(),
  month_number smallint    not null unique,
  note         text        not null default '',
  created_at   timestamptz not null default now()
);
-- Idempotent upgrade: earlier versions stored a single url on the milestone row;
-- media now lives in milestone_media, so drop the legacy column if present.
alter table public.milestones drop column if exists url;

-- Milestone media: the photos/videos attached to a month, ordered by position.
-- gallery_image_id, when set, marks a media item that was REUSED from an existing
-- gallery photo/video — its Cloudinary asset is owned by the gallery, so removing
-- it from a milestone must NOT destroy the underlying asset.
create table if not exists public.milestone_media (
  id               uuid        primary key default gen_random_uuid(),
  milestone_id     uuid        not null references public.milestones(id) on delete cascade,
  url              text        not null,
  media_type       text        not null default 'image',
  position         smallint    not null default 0,
  gallery_image_id uuid        references public.gallery_images(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists milestone_media_milestone_id_idx on public.milestone_media (milestone_id);
