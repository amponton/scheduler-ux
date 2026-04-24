# Gather — CLAUDE.md

## What the app does

Gather is a social event scheduling app. Authenticated users can create events, browse upcoming and past events in a dashboard or calendar view, and RSVP to events with a going/maybe/can't status. Hosts can edit and delete their own events. Auth is Google OAuth via Supabase.

## Stack

- **Frontend**: React 19 + Vite 8 (JavaScript, no TypeScript)
- **Backend**: Supabase (Postgres, Auth, RLS, Edge Functions)
- **Auth**: Google OAuth via Supabase
- **Styling**: Plain CSS (`src/App.css`, `src/index.css`) — no Tailwind, no CSS-in-JS

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
    events.js        # getEvents(), createEvent(), updateEvent(), deleteEvent()
    profiles.js      # getProfile(), saveProfile()
    rsvps.js         # getRsvps(), upsertRsvp(), deleteRsvp()
  components/
    Nav.jsx               # Top nav with profile dropdown, sign in/out
    LandingPage.jsx       # Unauthenticated landing
    Dashboard.jsx         # Upcoming + past event lists
    CalendarView.jsx      # Calendar layout; opens EventDetailModal on click
    EventCard.jsx         # Single event with RSVP buttons and AttendeeGroup
    AttendeeGroup.jsx     # Grouped attendee display by status; shows up to 5, expandable
    CreateEventModal.jsx  # Modal for creating new events
    EditEventModal.jsx    # Modal for editing existing events (host only)
    EventDetailModal.jsx  # Full event detail view with RSVP, edit/delete controls
    Settings.jsx          # User profile/notification settings
supabase/
  events.sql
  profiles.sql
  rsvps.sql
  functions/
    send-event-invites/   # Edge function: emails invitees via Resend on event create/update
    notify-host-on-rsvp/  # Edge function: notifies host via email or SMS on new RSVP
```

## State and navigation

All app state lives in `App.jsx` and is passed down as props — no global store. Navigation is a `view` string (`'landing' | 'dashboard' | 'calendar' | 'settings'`) with a `prevView` for back-navigation from settings. The `navigate()` helper updates both.

Key state properties:
- `rsvpAttendees` — `{ [eventId]: { going: [], maybe: [], cant: [] } }` for grouped attendee display
- `editingEvent` — the event currently open in EditEventModal, or null
- Handlers: `handleRsvp`, `handleEditEvent`, `handleDeleteEvent`

## Supabase schema

### `profiles`
Keyed by `auth.users.id`. Created automatically via a DB trigger (`handle_new_user`) that fires on new user signup and seeds `name`, `email`, and `timezone` from auth metadata. Stores: `name`, `email`, `phone`, `timezone`, `notifications` (JSONB: `{remindVia, rsvpVia}`), `contacts` (JSONB array).

### `events`
Stores: `title`, `date` (date), `time` (text), `location`, `description`, `host_id` (FK → auth.users), `host_name` (denormalized), `attendees` (JSONB array of email strings), `responses` (JSONB: `{going, maybe, cant}`). Note: `responses` is a legacy/denormalized field — RSVP state is tracked in the `rsvps` table.

### `rsvps`
Join table: `event_id` + `user_id` + `status` (`'going' | 'maybe' | 'cant'`) + `user_name` (denormalized for display). Unique constraint on `(event_id, user_id)`. Upserted on status change; deleted when toggling the same status off. Includes `updated_at` timestamp.

### RLS policies (all tables have RLS enabled)
- **events**: Users can only read events they host or are invited to (matched via `attendees @> to_jsonb(auth.email())`). Only the host can insert/update/delete.
- **profiles**: Strictly private — users can only read/write their own row.
- **rsvps**: All authenticated users can read; users can only insert/update/delete their own rows, and only for events they are invited to or host.

## Edge functions

### `send-event-invites`
Triggers on INSERT or UPDATE of an event. Sends HTML email invitations via Resend to attendees listed in the `attendees` JSONB array. On INSERT sends to all attendees; on UPDATE sends only to newly-added attendees.

### `notify-host-on-rsvp`
Triggers on INSERT of an RSVP. Queries the host's profile, checks their `notifications.rsvpVia` preference, and sends a notification via email (Resend) or SMS (Twilio). Skips notification if the host is RSVPing to their own event. Uses the service-role key to bypass RLS on profile queries.

## Conventions

- **New DB tables must include RLS policies** in the same change — never add a table without them.
- **Edge functions must include error logging** — add `console.error` on every catch block and verify invocation end-to-end before considering it done (silent failures have caused debugging pain before).
- **Destructive UI actions use inline confirmation** — avoid `window.confirm()` and avoid multi-step modals. Show the confirm prompt inline next to the trigger element.

## Key conventions

- **Lib functions throw on error** — callers use try/catch and log to console.
- **Optimistic RSVP updates** — `handleRsvp` in App.jsx updates local state immediately and rolls back on failure.
- **Profile fallback** — if `getProfile` throws (e.g. row doesn't exist yet), App falls back to auth metadata for name/email.
- **`getRsvps` returns a map** — `{ [eventId]: status }` for O(1) lookup per event card.
- **Edit/delete are host-only** — `onEdit` and `onDelete` callbacks are only passed to EventCard/EventDetailModal when the current user is the event host.
- **Env vars** in `.env.local`:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (required)
  - `RESEND_API_KEY` (required for email invites/notifications)
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (optional, for SMS notifications)
  - `APP_URL` (optional, defaults to `https://gather.app`)
  - `FROM_ADDRESS` (optional, defaults to `Gather <invites@gather.app>`)

## Working style

- If the user references an attachment, screenshot, or file, confirm it is actually present before searching the codebase for it.
- For UI work, prefer small verifiable steps: build → describe/screenshot → refine. Don't assume the first pass is accepted.

## Dev commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```
