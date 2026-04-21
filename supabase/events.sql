create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time text,
  location text,
  description text,
  host_id uuid references auth.users on delete cascade not null,
  host_name text,
  attendees jsonb default '[]',
  responses jsonb default '{"going": [], "maybe": [], "cant": []}',
  created_at timestamptz default now()
);

alter table public.events enable row level security;

-- Only the host and email-invited attendees can view an event
create policy "Host and invited users can view events"
  on public.events for select
  using (
    auth.uid() = host_id OR
    attendees @> to_jsonb(auth.email()::text)
  );

-- Only the host can create events
create policy "Users can create own events"
  on public.events for insert
  with check (auth.uid() = host_id);

-- Only the host can update or delete their events
create policy "Users can update own events"
  on public.events for update
  using (auth.uid() = host_id);

create policy "Users can delete own events"
  on public.events for delete
  using (auth.uid() = host_id);
