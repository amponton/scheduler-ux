---
name: SMS notifications deferred
description: SMS RSVP notifications are not yet wired up — Twilio onboarding was skipped
type: project
---

SMS notifications for host RSVP alerts are not yet implemented. The edge function `notify-host-on-rsvp` already has the Twilio integration written — it just silently skips SMS when credentials are absent.

**Why:** Twilio onboarding was deferred during initial build.

**How to apply:** When SMS is ready to enable, set these secrets and test:
```
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx TWILIO_AUTH_TOKEN=xxxxx TWILIO_FROM_NUMBER=+1xxxxxxxxxx
```
Free trial accounts can only SMS to verified numbers — upgrade to a paid account or verify numbers under Phone Numbers → Verified Caller IDs.
