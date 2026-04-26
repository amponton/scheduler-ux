create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  phone text,
  avatar_url text,
  timezone text,
  notifications jsonb default '{"remindVia": [], "rsvpVia": []}' check (
    jsonb_typeof(notifications->'remindVia') = 'array' AND
    jsonb_typeof(notifications->'rsvpVia') = 'array'
  ),
  -- contacts: array of {id, name, email} objects
  contacts jsonb default '[]',
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, timezone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'America/New_York'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

