-- === Column additions ===
alter table public.events    add column if not exists image_url       text;
alter table public.profiles  add column if not exists avatar_url      text;
alter table public.rsvps     add column if not exists user_email      text;
alter table public.rsvps     add column if not exists user_avatar_url text;

-- === Update events RLS to support new {name,email} attendee objects ===
drop policy if exists "Host and invited users can view events" on public.events;
create policy "Host and invited users can view events"
  on public.events for select
  using (
    auth.uid() = host_id OR
    attendees @> to_jsonb(auth.email()::text) OR
    exists (
      select 1 from jsonb_array_elements(attendees) a
      where a->>'email' = auth.email()
    )
  );

-- === Update rsvps RLS to match new attendee format ===
drop policy if exists "Users can view rsvps for accessible events"  on public.rsvps;
drop policy if exists "Users can insert own rsvps"                  on public.rsvps;
drop policy if exists "Users can update own rsvps"                  on public.rsvps;

create policy "Users can view rsvps for accessible events"
  on public.rsvps for select
  using (
    auth.uid() = user_id OR
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
      and (
        events.host_id = auth.uid() OR
        events.attendees @> to_jsonb(auth.email()::text) OR
        exists (
          select 1 from jsonb_array_elements(events.attendees) a
          where a->>'email' = auth.email()
        )
      )
    )
  );

create policy "Users can insert own rsvps"
  on public.rsvps for insert
  with check (
    auth.uid() = user_id AND
    exists (
      select 1 from public.events
      where id = event_id and (
        host_id = auth.uid() OR
        attendees @> to_jsonb(auth.email()::text) OR
        exists (
          select 1 from jsonb_array_elements(attendees) a
          where a->>'email' = auth.email()
        )
      )
    )
  );

create policy "Users can update own rsvps"
  on public.rsvps for update
  using (
    auth.uid() = user_id AND
    exists (
      select 1 from public.events
      where id = event_id and (
        host_id = auth.uid() OR
        attendees @> to_jsonb(auth.email()::text) OR
        exists (
          select 1 from jsonb_array_elements(attendees) a
          where a->>'email' = auth.email()
        )
      )
    )
  );

-- === Storage buckets ===
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- === Storage policies: avatars ===
drop policy if exists "Anyone can view avatars"          on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;

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

-- === Storage policies: event-images ===
drop policy if exists "Anyone can view event images"               on storage.objects;
drop policy if exists "Authenticated users can upload event images" on storage.objects;
drop policy if exists "Users can update own event images"          on storage.objects;
drop policy if exists "Users can delete own event images"          on storage.objects;

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
