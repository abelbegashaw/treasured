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
