create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  status text check (status in ('going', 'maybe', 'cant')) not null,
  updated_at timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.rsvps enable row level security;

create policy "Authenticated users can view all rsvps"
  on public.rsvps for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own rsvps"
  on public.rsvps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rsvps"
  on public.rsvps for update
  using (auth.uid() = user_id);

create policy "Users can delete own rsvps"
  on public.rsvps for delete
  using (auth.uid() = user_id);
