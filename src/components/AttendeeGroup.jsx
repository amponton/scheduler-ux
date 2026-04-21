import { useState } from 'react'

function AttendeesModal({ label, names, onClose }) {
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal attendees-modal">
        <div className="modal-header">
          <h2 className="modal-title">{label}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <ul className="attendees-list">
          {names.map((name, i) => (
            <li key={i} className="attendees-list-item">{name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function AttendeeGroup({ label, names, colorClass }) {
  const [showModal, setShowModal] = useState(false)

  if (names.length === 0) return null

  return (
    <>
      <div className="attendee-group">
        <span className={`attendee-group-label ${colorClass}`}>{label}</span>
        {names.slice(0, 5).map((name, i) => (
          <span key={i} className="attendee-name">{name}</span>
        ))}
        {names.length > 5 && (
          <button className="attendee-more-btn" onClick={() => setShowModal(true)}>
            +{names.length - 5} more
          </button>
        )}
      </div>

      {showModal && (
        <AttendeesModal
          label={label}
          names={names}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
