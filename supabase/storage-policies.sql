-- Supabase Storage policies for MinorityWin social market images.
-- Run this in the Supabase SQL editor for the project used by VITE_SUPABASE_URL.
-- It allows the frontend anon key to upload/read images only under:
--   storage bucket: uneventful
--   object prefix: minority-win/*

insert into storage.buckets (id, name, public)
values ('uneventful', 'uneventful', true)
on conflict (id) do update set public = true;

drop policy if exists "minority win images are publicly readable" on storage.objects;
drop policy if exists "anon can upload minority win images" on storage.objects;

create policy "minority win images are publicly readable"
on storage.objects
for select

to anon, authenticated
using (
  bucket_id = 'uneventful'
  and (storage.foldername(name))[1] = 'minority-win'
);

create policy "anon can upload minority win images"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'uneventful'
  and (storage.foldername(name))[1] = 'minority-win'
);
