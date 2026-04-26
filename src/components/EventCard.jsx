import AttendeeGroup from './AttendeeGroup'
import DeleteConfirmButton from './DeleteConfirmButton'
import { getEventBackground } from './EventImage'

export default function EventCard({ event, rsvpStatus, rsvpAttendees, onRsvp, showHost, onEdit, onDelete }) {
  const { id, title, date, time, location, description, host_name, image_url, attendees } = event

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const going = rsvpAttendees?.going ?? []
  const maybe = rsvpAttendees?.maybe ?? []
  const cant = rsvpAttendees?.cant ?? []

  const rsvpdEmails = new Set(
    [...going, ...maybe, ...cant].map(a => a.email?.toLowerCase()).filter(Boolean)
  )
  const invited = (attendees ?? []).filter(
    a => a.email && !rsvpdEmails.has(a.email.toLowerCase())
  )

  const noResponses = going.length === 0 && maybe.length === 0 && cant.length === 0 && invited.length === 0

  const bg = getEventBackground(image_url)
  const cardStyle = bg?.type === 'upload'
    ? { backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : bg?.type === 'preset'
    ? { background: bg.bg }
    : {}

  return (
    <div className={`event-card${bg ? ' has-event-bg' : ''}`} style={cardStyle}>
      <div className="event-bg-clip">
        {bg?.type === 'upload' && <div className="event-bg-overlay" />}
        {bg?.type === 'preset' && <div className="event-bg-emoji" aria-hidden="true">{bg.emoji}</div>}
      </div>
      <div className="event-card-body">
        <div className="event-meta">
          <span className="event-date">{formattedDate}</span>
          {time && <span className="event-time">{time}</span>}
          {onEdit && <button className="event-edit-btn" onClick={() => onEdit(event)}>Edit</button>}
          {onDelete && <DeleteConfirmButton onConfirm={() => onDelete(id)} />}
        </div>
        <h2 className="event-title">{title}</h2>
        {showHost && host_name && <p className="event-host">Hosted by {host_name}</p>}
        {location && <p className="event-location">{location}</p>}
        {description && <p className="event-desc">{description}</p>}

        <div className="event-card-footer">
          <div className="event-responses">
            {noResponses && (
              <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>No responses yet</span>
            )}
            <AttendeeGroup label="Attending" attendees={going} colorClass="response-going" />
            <AttendeeGroup label="Maybe" attendees={maybe} colorClass="response-maybe" />
            <AttendeeGroup label="Can't make it" attendees={cant} colorClass="response-cant" />
            <AttendeeGroup label="Invited" attendees={invited} colorClass="response-invited" />
          </div>
          <div className="rsvp-buttons">
            {['going', 'maybe', 'cant'].map(status => (
              <button
                key={status}
                className={`rsvp-btn${rsvpStatus === status ? ` rsvp-active ${status}` : ''}`}
                onClick={() => onRsvp(id, status)}
              >
                {status === 'going' ? 'Going' : status === 'maybe' ? 'Maybe' : "Can't make it"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
