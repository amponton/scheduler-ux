export default function EventCard({ event, rsvpStatus, onRsvp, showHost, onEdit }) {
  const { id, title, date, time, location, description, responses, host_name } = event

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const goingCount = responses.going.length
  const maybeCount = responses.maybe.length
  const cantCount = responses.cant.length

  return (
    <div className="event-card">
      <div className="event-meta">
        <span className="event-date">{formattedDate}</span>
        {time && <span className="event-time">{time}</span>}
        {onEdit && <button className="event-edit-btn" onClick={() => onEdit(event)}>Edit</button>}
      </div>
      <h2 className="event-title">{title}</h2>
      {showHost && host_name && <p className="event-host">Hosted by {host_name}</p>}
      {location && <p className="event-location">{location}</p>}
      {description && <p className="event-desc">{description}</p>}

      <div className="event-card-footer">
        <div className="event-responses">
          {goingCount > 0 && (
            <span className="response-going">{goingCount} going</span>
          )}
          {maybeCount > 0 && (
            <span className="response-maybe">{maybeCount} maybe</span>
          )}
          {cantCount > 0 && (
            <span className="response-cant">{cantCount} can't make it</span>
          )}
          {goingCount === 0 && maybeCount === 0 && cantCount === 0 && (
            <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>No responses yet</span>
          )}
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
  )
}
