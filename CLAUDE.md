# Gather — CLAUDE.md

## What the app does

Gather is a social event scheduling app. Authenticated users can create events, browse upcoming and past events in a dashboard or calendar view, and RSVP to events with a going/maybe/can't status. Hosts can edit and delete their own events. Auth is Google OAuth via Supabase.

## Stack

- **Frontend**: React 19 + Vite 8 (JavaScript, no TypeScript)
- **Backend**: Supabase (Postgres, Auth, RLS, Edge Functions, Storage)
- **Auth**: Google OAuth via Supabase
- **Styling**: Plain CSS (`src/index.css`) — no Tailwind, no CSS-in-JS

## Project structure

```
src/
  App.jsx            # Root component; owns all state, auth lifecycle, and navigation
  supabase.js        # Supabase client (reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
  lib/
    events.js        # getEvents(), createEvent(), updateEvent(), deleteEvent()
    profiles.js      # getProfile(), saveProfile()
    rsvps.js         # getRsvps(), upsertRsvp(), deleteRsvp()
    storage.js       # uploadAvatar(userId, file), uploadEventImage(userId, file)
  components/
    Nav.jsx               # Top nav with avatar/initials, profile dropdown, sign in/out
    LandingPage.jsx       # Unauthenticated landing
    Dashboard.jsx         # Upcoming + past event lists
    CalendarView.jsx      # Calendar layout; opens EventDetailModal on click
    EventCard.jsx         # Single event card with image banner, RSVP buttons, AttendeeGroup
    EventImage.jsx        # Renders event image: preset tile (emoji+color) or uploaded photo
    ImagePicker.jsx       # Preset grid + file upload for choosing event images
    AttendeeGroup.jsx     # Attendee avatars grouped by RSVP status; hover tooltip shows name+email
    CreateEventModal.jsx  # Modal for creating new events (invitee list + image picker)
    EditEventModal.jsx    # Modal for editing existing events (host only)
    EventDetailModal.jsx  # Full event detail view with image, RSVP, edit/delete controls
    DeleteConfirmButton.jsx # Inline confirm/cancel for destructive actions
    Settings.jsx          # User profile (with avatar upload), contacts, notification settings
supabase/
  events.sql         # Canonical events table schema + RLS
  profiles.sql       # Canonical profiles table schema + RLS + handle_new_user trigger
  rsvps.sql          # Canonical rsvps table schema + RLS
  storage.sql        # Storage bucket creation + policies for avatars and event-images
  migrate.sql        # One-time migration (already applied): adds new columns + updates policies
  functions/
    send-event-invites/   # Edge function: emails invitees via Resend on event create/update
    notify-host-on-rsvp/  # Edge function: notifies host via email or SMS on new RSVP
```

## State and navigation

All app state lives in `App.jsx` and is passed down as props — no global store. Navigation is a `view` string (`'landing' | 'dashboard' | 'calendar' | 'settings'`) with a `prevView` for back-navigation from settings. The `navigate()` helper updates both.

Key state properties:
- `rsvpAttendees` — `{ [eventId]: { going: [], maybe: [], cant: [] } }` where each array holds `{name, email, avatar_url}` attendee objects
- `editingEvent` — the event currently open in EditEventModal, or null
- `settings` — includes `avatar_url` for the current user's profile photo
- Handlers: `handleRsvp`, `handleEditEvent`, `handleDeleteEvent`

## Supabase schema

### `profiles`
Keyed by `auth.users.id`. Created automatically via a DB trigger (`handle_new_user`) that fires on new user signup and seeds `name`, `email`, and `timezone` from auth metadata. Stores: `name`, `email`, `phone`, `avatar_url`, `timezone`, `notifications` (JSONB: `{remindVia, rsvpVia}`), `contacts` (JSONB array of `{id, name, email}` objects — no phone).

### `events`
Stores: `title`, `date` (date), `time` (text), `location`, `description`, `image_url`, `host_id` (FK → auth.users), `host_name` (denormalized), `attendees` (JSONB array of `{name, email}` objects), `responses` (JSONB: legacy/denormalized — RSVP state is tracked in the `rsvps` table).

### `rsvps`
Join table: `event_id` + `user_id` + `status` (`'going' | 'maybe' | 'cant'`) + `user_name`, `user_email`, `user_avatar_url` (all denormalized for display). Unique constraint on `(event_id, user_id)`. Upserted on status change; deleted when toggling the same status off.

### Storage buckets
- `avatars` — public; users upload to `{userId}/avatar.{ext}` via `uploadAvatar()`
- `event-images` — public; users upload to `{userId}/{timestamp}.{ext}` via `uploadEventImage()`

### Event image format (`image_url`)
- `null` — no image
- `"preset:birthday"` (or other preset id) — rendered as a colored tile with emoji by `EventImage.jsx`
- `"https://..."` — an uploaded photo URL from Supabase Storage

### Preset event types
Defined in `EventImage.jsx` as `PRESETS`: birthday, anniversary, dinner, party, wedding, graduation, game-night, outdoor, holiday, sports, concert, movie.

### RLS policies (all tables have RLS enabled)
- **events**: Host or invited attendees can read. Invitation matched via `a->>'email' = auth.email()` against the `{name,email}` objects in `attendees`. Only host can insert/update/delete.
- **profiles**: Strictly private — users can only read/write their own row.
- **rsvps**: Users can read RSVPs for events they host or are invited to. Users can only insert/update/delete their own RSVPs for events they're invited to or host.
- **storage.objects**: Public read on both buckets; write/update/delete restricted to the owning user (matched by `{userId}/` folder prefix).

## Edge functions

### `send-event-invites`
Triggers on INSERT or UPDATE of an event. Normalizes `attendees` (handles both old string and new `{name,email}` object format). On INSERT sends to all invitees; on UPDATE sends only to newly-added ones. Personalizes greeting with invitee name if available.

### `notify-host-on-rsvp`
Triggers on INSERT of an RSVP. Queries the host's profile, checks their `notifications.rsvpVia` preference, and sends notification via email (Resend) or SMS (Twilio). Skips if host is RSVPing their own event.

## Conventions

- **New DB tables must include RLS policies** in the same change — never add a table without them.
- **Edge functions must include error logging** — add `console.error` on every catch block and verify invocation end-to-end before considering it done (silent failures have caused debugging pain before).
- **Destructive UI actions use inline confirmation** — avoid `window.confirm()` and avoid multi-step modals. Show the confirm prompt inline next to the trigger element.
- **Lib functions throw on error** — callers use try/catch and log to console.
- **Optimistic RSVP updates** — `handleRsvp` in App.jsx updates local state immediately and rolls back on failure.
- **Profile fallback** — if `getProfile` throws (e.g. row doesn't exist yet), App falls back to auth metadata for name/email.
- **`getRsvps` returns a map** — `{ statuses: {[eventId]: status}, attendees: {[eventId]: {going,maybe,cant}} }`.
- **Edit/delete are host-only** — `onEdit` and `onDelete` callbacks are only passed to EventCard/EventDetailModal when the current user is the event host.
- **`AttendeeGroup` receives `attendees` prop** (array of `{name,email,avatar_url}` objects), not a `names` string array.

## Env vars (`.env.local`)
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
