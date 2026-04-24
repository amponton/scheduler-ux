# Gather — Architecture Diagram

```mermaid
graph TD
  subgraph Browser ["Browser — React 19 + Vite"]
    direction TB
    App["App.jsx\nstate · auth lifecycle · navigation"]

    subgraph Components
      Nav["Nav"]
      Dashboard["Dashboard"]
      Calendar["CalendarView"]
      EventCard["EventCard + AttendeeGroup"]
      EventDetail["EventDetailModal"]
      CreateModal["CreateEventModal"]
      EditModal["EditEventModal"]
      Settings["Settings"]
    end

    subgraph Lib ["src/lib/"]
      LibEvents["events.js\ngetEvents · createEvent\nupdateEvent · deleteEvent"]
      LibProfiles["profiles.js\ngetProfile · saveProfile"]
      LibRsvps["rsvps.js\ngetRsvps · upsertRsvp · deleteRsvp"]
    end

    App --> Components
    App --> Lib
  end

  subgraph SupabaseCloud ["Supabase"]
    direction TB
    SupaAuth["Auth\n(Google OAuth)"]

    subgraph DB ["Postgres + RLS"]
      TProfiles[("profiles")]
      TEvents[("events")]
      TRsvps[("rsvps")]
    end

    subgraph EdgeFunctions ["Edge Functions"]
      EF1["send-event-invites\nINSERT · UPDATE on events"]
      EF2["notify-host-on-rsvp\nINSERT on rsvps"]
    end

    TEvents -->|trigger| EF1
    TRsvps  -->|trigger| EF2
  end

  subgraph External ["External Services"]
    Google["Google OAuth"]
    Resend["Resend\n(email)"]
    Twilio["Twilio\n(SMS)"]
  end

  Lib -->|supabase-js v2| SupaAuth
  Lib -->|supabase-js v2| DB

  SupaAuth -->|OAuth| Google

  EF1 --> Resend
  EF2 --> Resend
  EF2 -->|rsvpVia = sms| Twilio
```

## Layer summary

| Layer | Technology | Responsibility |
|---|---|---|
| Browser | React 19 + Vite | UI, state, navigation |
| Auth | Supabase Auth + Google OAuth | Session management, JWT |
| Database | Supabase Postgres + RLS | Data storage, access control |
| Edge Functions | Supabase (Deno) | Email invites, host notifications |
| Email | Resend | Transactional email delivery |
| SMS | Twilio | Optional SMS notifications |

## Data flow — key paths

**User creates an event**
1. `CreateEventModal` → `App.handleCreateEvent` → `lib/events.createEvent`
2. Supabase inserts row into `events` (RLS: `host_id = auth.uid()`)
3. `send-event-invites` edge function fires → Resend emails all invitees

**User RSVPs**
1. `EventCard` / `EventDetailModal` → `App.handleRsvp` → `lib/rsvps.upsertRsvp` (optimistic update)
2. Supabase upserts row into `rsvps` (RLS: user must be host or invited attendee)
3. `notify-host-on-rsvp` edge function fires → Resend or Twilio notifies host based on `profiles.notifications.rsvpVia`

**Auth**
1. `Nav` sign-in → Supabase Google OAuth → session stored in browser
2. `App.jsx` listens to `onAuthStateChange` → fetches profile + events + RSVPs on session start
