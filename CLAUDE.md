# Gather — CLAUDE.md

## What the app does

Gather is a social event scheduling app. Authenticated users can create events, browse upcoming and past events in a dashboard or calendar view, and RSVP to events with a going/maybe/can't status. Auth is Google OAuth via Supabase.

## Tech stack

- **React 19** + **Vite 8** (ESM, no TypeScript)
- **Supabase JS v2** for auth, database, and RLS
- **Plain CSS** — no Tailwind, no CSS-in-JS; styles live in `src/App.css` and `src/index.css`
- No client-side router — view state is a string managed in `App.jsx`

## Project structure

```
src/
  App.jsx            # Root component; owns all state, auth lifecycle, and navigation
  supabase.js        # Supabase client (reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
  lib/
    events.js        # getEvents(), createEvent()
    profiles.js      # getProfile(), saveProfile()
    rsvps.js         # getRsvps(), upsertRsvp(), deleteRsvp()
  components/
    Nav.jsx          # Top nav with profile dropdown, sign in/out
    LandingPage.jsx  # Unauthenticated landing
    Dashboard.jsx    # Upcoming + past event lists
    CalendarView.jsx # Calendar layout
    EventCard.jsx    # Single event with RSVP buttons
    CreateEventModal.jsx
    Settings.jsx     # User profile/notification settings
supabase/
  events.sql
  profiles.sql
  rsvps.sql
```

## State and navigation

All app state lives in `App.jsx` and is passed down as props — no global store. Navigation is a `view` string (`'landing' | 'dashboard' | 'calendar' | 'settings'`) with a `prevView` for back-navigation from settings. The `navigate()` helper updates both.

## Supabase schema

### `profiles`
Keyed by `auth.users.id`. Created automatically via a DB trigger (`handle_new_user`) that fires on new user signup and seeds `name`, `email`, and `timezone` from auth metadata. Stores: `name`, `email`, `phone`, `timezone`, `notifications` (JSONB: `{remindVia, rsvpVia}`), `contacts` (JSONB array).

### `events`
Stores: `title`, `date` (date), `time` (text), `location`, `description`, `host_id` (FK → auth.users), `host_name` (denormalized), `attendees` (JSONB array), `responses` (JSONB: `{going, maybe, cant}`). Note: `responses` appears to be a legacy/denormalized field — RSVP state is now tracked in the `rsvps` table.

### `rsvps`
Join table: `event_id` + `user_id` + `status` (`'going' | 'maybe' | 'cant'`). Unique constraint on `(event_id, user_id)`. Upserted on status change; deleted when toggling the same status off.

### RLS policies (all tables have RLS enabled)
- **events**: All authenticated users can read; only the host can insert/update/delete.
- **profiles**: Strictly private — users can only read/write their own row.
- **rsvps**: All authenticated users can read; users can only insert/update/delete their own rows.

## Key conventions

- **Lib functions throw on error** — callers use try/catch and log to console.
- **Optimistic RSVP updates** — `handleRsvp` in App.jsx updates local state immediately and rolls back on failure.
- **Profile fallback** — if `getProfile` throws (e.g. row doesn't exist yet), App falls back to auth metadata for name/email.
- **`getRsvps` returns a map** — `{ [eventId]: status }` for O(1) lookup per event card.
- **Env vars**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.

## Dev commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```
