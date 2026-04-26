-- Run this in the Supabase SQL editor after creating the buckets via the dashboard,
-- or use the Storage section of the dashboard to create the buckets first.

-- Create public buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict do nothing;

-- === Avatars policies ===

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- === Event images policies ===

create policy "Anyone can view event images"
  on storage.objects for select
  using (bucket_id = 'event-images');

create policy "Authenticated users can upload event images"
  on storage.objects for insert
  with check (
    bucket_id = 'event-images' AND
    auth.uid() is not null AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own event images"
  on storage.objects for update
  using (
    bucket_id = 'event-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own event images"
  on storage.objects for delete
  using (
    bucket_id = 'event-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
