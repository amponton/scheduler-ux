export default function EventDetailModal({ event, rsvpStatus, rsvpAttendees, onRsvp, onClose, onEdit }) {
  const { id, title, date, time, location, description, host_name } = event

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const going = rsvpAttendees?.going ?? []
  const maybe = rsvpAttendees?.maybe ?? []
  const cant = rsvpAttendees?.cant ?? []
  const noResponses = going.length === 0 && maybe.length === 0 && cant.length === 0

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onEdit && <button className="event-edit-btn" onClick={() => { onClose(); onEdit(event) }}>Edit</button>}
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
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
            {noResponses && <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>No responses yet</span>}
            {going.length > 0 && <span className="response-going">{going.join(', ')} going</span>}
            {maybe.length > 0 && <span className="response-maybe">{maybe.join(', ')} maybe</span>}
            {cant.length > 0 && <span className="response-cant">{cant.join(', ')} can't make it</span>}
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
