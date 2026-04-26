-- Clear all table data
truncate table public.rsvps    restart identity cascade;
truncate table public.events   restart identity cascade;
truncate table public.profiles restart identity cascade;

-- === Simplify events RLS — new {name,email} object format only ===
drop policy if exists "Host and invited users can view events" on public.events;
create policy "Host and invited users can view events"
  on public.events for select
  using (
    auth.uid() = host_id OR
    exists (
      select 1 from jsonb_array_elements(attendees) a
      where a->>'email' = auth.email()
    )
  );

-- === Simplify rsvps RLS ===
drop policy if exists "Users can view rsvps for accessible events" on public.rsvps;
drop policy if exists "Users can insert own rsvps"                 on public.rsvps;
drop policy if exists "Users can update own rsvps"                 on public.rsvps;

create policy "Users can view rsvps for accessible events"
  on public.rsvps for select
  using (
    auth.uid() = user_id OR
    exists (
      select 1 from public.events
      where events.id = rsvps.event_id
      and (
        events.host_id = auth.uid() OR
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
        exists (
          select 1 from jsonb_array_elements(attendees) a
          where a->>'email' = auth.email()
        )
      )
    )
  );
