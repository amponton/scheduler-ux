import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const APP_URL = Deno.env.get('APP_URL') ?? 'https://gather.app'
const FROM_ADDRESS = Deno.env.get('FROM_ADDRESS') ?? 'Gather <invites@gather.app>'

type Invitee = { name?: string; email: string }

function normalizeAttendees(raw: unknown[]): Invitee[] {
  return raw.map((a) => {
    if (typeof a === 'string') return { email: a }
    const obj = a as Record<string, string>
    return { name: obj.name || undefined, email: obj.email }
  }).filter((a) => !!a.email)
}

function buildEmailHtml(event: Record<string, unknown>, recipientName?: string): string {
  const formattedDate = new Date((event.date as string) + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'

  const details = [
    event.time
      ? `<p><strong>When:</strong> ${formattedDate} at ${event.time}</p>`
      : `<p><strong>When:</strong> ${formattedDate}</p>`,
    event.location ? `<p><strong>Where:</strong> ${event.location}</p>` : '',
    event.description ? `<p><strong>Details:</strong> ${event.description}</p>` : '',
  ].filter(Boolean).join('\n')

  return `
    <p>${greeting}</p>
    <p><strong>${event.host_name ?? 'Someone'}</strong> has invited you to <strong>${event.title}</strong>.</p>
    ${details}
    <p><a href="${APP_URL}">Sign in to RSVP →</a></p>
  `
}

async function sendInvites(invitees: Invitee[], event: Record<string, unknown>): Promise<void> {
  if (invitees.length === 0) return

  const results = await Promise.allSettled(
    invitees.map(async ({ email, name }) => {
      const html = buildEmailHtml(event, name)
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: email,
          subject: `You're invited: ${event.title}`,
          html,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Resend rejected ${email} (${res.status}): ${body}`)
      }
    })
  )

  results.forEach((r) => {
    if (r.status === 'rejected') console.error('Failed to send invite:', r.reason)
  })
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const { type, record: event, old_record: oldEvent } = payload

    if (type === 'INSERT') {
      const invitees = normalizeAttendees(Array.isArray(event?.attendees) ? event.attendees : [])
      await sendInvites(invitees, event)
    } else if (type === 'UPDATE') {
      const newInvitees = normalizeAttendees(Array.isArray(event?.attendees) ? event.attendees : [])
      const oldEmails = new Set(
        normalizeAttendees(Array.isArray(oldEvent?.attendees) ? oldEvent.attendees : [])
          .map((a) => a.email)
      )
      const added = newInvitees.filter((a) => !oldEmails.has(a.email))
      await sendInvites(added, event)
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('Internal error', { status: 500 })
  }
})
