export default function EventDetailModal({ event, rsvpStatus, onRsvp, onClose }) {
  const { id, title, date, time, location, description, responses, host_name } = event

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const goingCount = responses.going.length
  const maybeCount = responses.maybe.length
  const cantCount = responses.cant.length

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="event-detail-body">
          <div className="event-detail-meta">
            <span className="event-date">{formattedDate}</span>
            {time && <span className="event-time">{time}</span>}
          </div>

          {location && <p className="event-detail-row"><span className="event-detail-label">Where</span>{location}</p>}
          {host_name && <p className="event-detail-row"><span className="event-detail-label">Host</span>{host_name}</p>}
          {description && <p className="event-detail-desc">{description}</p>}

          <div className="event-responses">
            {goingCount > 0 && <span className="response-going">{goingCount} going</span>}
            {maybeCount > 0 && <span className="response-maybe">{maybeCount} maybe</span>}
            {cantCount > 0 && <span className="response-cant">{cantCount} can't make it</span>}
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
    </div>
  )
}
