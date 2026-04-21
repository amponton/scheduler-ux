import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_ADDRESS = Deno.env.get('FROM_ADDRESS') ?? 'Gather <invites@gather.app>'
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  })
  if (!res.ok) throw new Error(`Resend rejected (${res.status}): ${await res.text()}`)
}

async function sendSms(to: string, body: string): Promise<void> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    throw new Error('Twilio credentials not configured')
  }
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: TWILIO_FROM_NUMBER, To: to, Body: body }).toString(),
    }
  )
  if (!res.ok) throw new Error(`Twilio error: ${await res.text()}`)
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const rsvp = payload.record

    // Fetch the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, date, time, host_id')
      .eq('id', rsvp.event_id)
      .single()

    if (eventError || !event) return new Response('Event not found', { status: 200 })

    // Skip if the host is RSVPing to their own event
    if (rsvp.user_id === event.host_id) return new Response('Host RSVP — skipping', { status: 200 })

    // Fetch the host's profile using service role key (bypasses RLS)
    const { data: host, error: hostError } = await supabase
      .from('profiles')
      .select('name, email, phone, notifications')
      .eq('id', event.host_id)
      .single()

    if (hostError || !host) return new Response('Host profile not found', { status: 200 })

    const rsvpVia: string[] = host.notifications?.rsvpVia ?? []
    if (rsvpVia.length === 0) return new Response('No RSVP notifications enabled', { status: 200 })

    const rsvperName = rsvp.user_name || 'Someone'
    const statusLabel = rsvp.status === 'going' ? 'Going' : rsvp.status === 'maybe' ? 'Maybe' : "Can't make it"
    const formattedDate = new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
    const timeStr = event.time ? ` at ${event.time}` : ''

    const tasks: Promise<void>[] = []

    if (rsvpVia.includes('email') && host.email) {
      tasks.push(sendEmail(
        host.email,
        `New RSVP for ${event.title}`,
        `<p>Hi ${host.name ?? 'there'},</p>
         <p><strong>${rsvperName}</strong> responded <strong>${statusLabel}</strong> to <strong>${event.title}</strong> (${formattedDate}${timeStr}).</p>`
      ))
    }

    if (rsvpVia.includes('sms') && host.phone) {
      tasks.push(sendSms(
        host.phone,
        `Gather: ${rsvperName} responded ${statusLabel} to ${event.title} (${formattedDate}${timeStr}).`
      ))
    }

    const results = await Promise.allSettled(tasks)
    results.forEach(r => { if (r.status === 'rejected') console.error(r.reason) })

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('Internal error', { status: 500 })
  }
})
