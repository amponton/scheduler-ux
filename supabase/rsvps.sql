create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  status text check (status in ('going', 'maybe', 'cant')) not null,
  user_name text,
  updated_at timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.rsvps enable row level security;

create policy "Users can view rsvps for accessible events"
  on public.rsvps for select
  using (
    auth.uid() = user_id OR
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
      and (
        events.host_id = auth.uid() OR
        events.attendees @> to_jsonb(auth.email()::text)
      )
    )
  );

-- Users can only RSVP to events they are host or invited to
create policy "Users can insert own rsvps"
  on public.rsvps for insert
  with check (
    auth.uid() = user_id AND
    exists (
      select 1 from public.events
      where id = event_id and (
        host_id = auth.uid() OR
        attendees @> to_jsonb(auth.email()::text)
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
        attendees @> to_jsonb(auth.email()::text)
      )
    )
  );

create policy "Users can delete own rsvps"
  on public.rsvps for delete
  using (auth.uid() = user_id);
