create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time text,
  location text,
  description text,
  image_url text,
  host_id uuid references auth.users on delete cascade not null,
  host_name text,
  -- attendees: array of {name, email} objects, e.g. [{"name":"Jane","email":"jane@example.com"}]
  attendees jsonb default '[]',
  responses jsonb default '{"going": [], "maybe": [], "cant": []}',
  created_at timestamptz default now()
);

alter table public.events enable row level security;

create policy "Host and invited users can view events"
  on public.events for select
  using (
    auth.uid() = host_id OR
    exists (
      select 1 from jsonb_array_elements(attendees) a
      where a->>'email' = auth.email()
    )
  );

create policy "Users can create own events"
  on public.events for insert
  with check (auth.uid() = host_id);

create policy "Users can update own events"
  on public.events for update
  using (auth.uid() = host_id);

create policy "Users can delete own events"
  on public.events for delete
  using (auth.uid() = host_id);

