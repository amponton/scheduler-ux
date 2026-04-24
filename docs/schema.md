# Supabase Schema Audit
## Gather Project

Three main tables manage core functionality:
- **profiles** — user profile information and notification preferences
- **events** — event details, hosted by users
- **rsvps** — user responses to events

---

## Table: `public.profiles`

### Columns
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | — | PRIMARY KEY, FK to `auth.users(id)` ON DELETE CASCADE |
| `name` | text | YES | NULL | — |
| `email` | text | YES | NULL | — |
| `phone` | text | YES | NULL | — |
| `timezone` | text | YES | NULL | — |
| `notifications` | jsonb | NO | `{"remindVia": [], "rsvpVia": []}` | — |
| `contacts` | jsonb | NO | `[]` | — |
| `updated_at` | timestamptz | NO | `now()` | — |

### Foreign Keys
- `id` → `auth.users(id)` ON DELETE CASCADE

### RLS Status
**Enabled** ✓

### RLS Policies
| Policy Name | Command | USING | WITH CHECK |
|-------------|---------|-------|------------|
| Users can view own profile | SELECT | `auth.uid() = id` | — |
| Users can insert own profile | INSERT | — | `auth.uid() = id` |
| Users can update own profile | UPDATE | `auth.uid() = id` | — |

### Notes
- Profile row is auto-created on signup via `handle_new_user()` DB trigger, seeding `name`, `email`, and `timezone` from auth metadata.

---

## Table: `public.events`

### Columns
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| `title` | text | NO | — | — |
| `date` | date | NO | — | — |
| `time` | text | YES | NULL | — |
| `location` | text | YES | NULL | — |
| `description` | text | YES | NULL | — |
| `host_id` | uuid | NO | — | FK to `auth.users(id)` ON DELETE CASCADE |
| `host_name` | text | YES | NULL | Denormalized |
| `attendees` | jsonb | NO | `[]` | Array of invited email strings |
| `responses` | jsonb | NO | `{"going": [], "maybe": [], "cant": []}` | Legacy/denormalized — live state is in `rsvps` |
| `created_at` | timestamptz | NO | `now()` | — |

### Foreign Keys
- `host_id` → `auth.users(id)` ON DELETE CASCADE

### RLS Status
**Enabled** ✓

### RLS Policies
| Policy Name | Command | USING | WITH CHECK |
|-------------|---------|-------|------------|
| Host and invited users can view events | SELECT | `auth.uid() = host_id OR attendees @> to_jsonb(auth.email()::text)` | — |
| Users can create own events | INSERT | — | `auth.uid() = host_id` |
| Users can update own events | UPDATE | `auth.uid() = host_id` | — |
| Users can delete own events | DELETE | `auth.uid() = host_id` | — |

---

## Table: `public.rsvps`

### Columns
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| `event_id` | uuid | NO | — | FK to `public.events(id)` ON DELETE CASCADE |
| `user_id` | uuid | NO | — | FK to `auth.users(id)` ON DELETE CASCADE |
| `status` | text | NO | — | CHECK: `'going' \| 'maybe' \| 'cant'` |
| `user_name` | text | YES | NULL | Denormalized for display |
| `updated_at` | timestamptz | NO | `now()` | — |
| — | — | — | — | UNIQUE(`event_id`, `user_id`) |

### Foreign Keys
- `event_id` → `public.events(id)` ON DELETE CASCADE
- `user_id` → `auth.users(id)` ON DELETE CASCADE

### RLS Status
**Enabled** ✓

### RLS Policies
| Policy Name | Command | USING | WITH CHECK |
|-------------|---------|-------|------------|
| Authenticated users can view all rsvps | SELECT | `auth.role() = 'authenticated'` | — |
| Users can insert own rsvps | INSERT | — | `auth.uid() = user_id AND EXISTS (event host or invited attendee check)` |
| Users can update own rsvps | UPDATE | `auth.uid() = user_id AND EXISTS (event host or invited attendee check)` | — |
| Users can delete own rsvps | DELETE | `auth.uid() = user_id` | — |

---

## Edge Functions

### `send-event-invites`
Triggered on INSERT or UPDATE of an event. Sends HTML email invitations via Resend to addresses in the `attendees` array. On INSERT sends to all attendees; on UPDATE sends only to newly-added attendees.

**Env vars**: `RESEND_API_KEY` (required), `APP_URL`, `FROM_ADDRESS`

### `notify-host-on-rsvp`
Triggered on INSERT of an RSVP. Reads host's `notifications.rsvpVia` preference and sends via email (Resend) or SMS (Twilio). Skips if host is RSVPing to their own event. Uses service role key to bypass RLS for profile access.

**Env vars**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `FROM_ADDRESS`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`

---

## Flags & Notes

### ✅ Fixed

**RSVP SELECT policy was overly permissive** *(fixed in `rsvps.sql`)*
- Old policy: `using (auth.role() = 'authenticated')` allowed any user to read all RSVPs.
- New policy: `"Users can view rsvps for accessible events"` — restricts to own RSVPs and RSVPs for events the user hosts or is invited to.

**JSONB attendee list relied on exact email string match** *(fixed in `src/lib/events.js`)*
- `createEvent` and `updateEvent` now normalize attendee emails with `.trim().toLowerCase()` before writing, ensuring RLS email matching is reliable.

**`notifications` JSONB had no structural validation** *(fixed in `profiles.sql`)*
- Added a CHECK constraint enforcing that `remindVia` and `rsvpVia` are both JSON arrays.

### ℹ️ Observations

- All foreign keys use ON DELETE CASCADE — deleting a user cascades to their events and RSVPs; deleting an event cascades to its RSVPs.
- No audit trail (who changed what, when) beyond `profiles.updated_at` and `events.created_at`.
- The `responses` column on `events` is legacy/denormalized — live RSVP state lives in the `rsvps` table.
