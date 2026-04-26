import { useState } from 'react'

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

const AVATAR_COLORS = ['#7b8fa1', '#8a7b9e', '#7b9e8a', '#9e8a7b', '#9e7b8a', '#8a9e7b']

function getAvatarColor(name) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xfffffff
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function AttendeeAvatar({ attendee }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const name = attendee.name || attendee.email || 'Unknown'
  const showEmail = attendee.email && attendee.email !== name

  return (
    <div
      className="attendee-avatar"
      style={!attendee.avatar_url ? { background: getAvatarColor(name) } : undefined}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {attendee.avatar_url
        ? <img src={attendee.avatar_url} alt={name} />
        : <span>{getInitials(name)}</span>
      }
      {showTooltip && (
        <div className="attendee-avatar-tooltip">
          <div className="attendee-tooltip-name">{name}</div>
          {showEmail && <div className="attendee-tooltip-email">{attendee.email}</div>}
        </div>
      )}
    </div>
  )
}

function AttendeesModal({ label, attendees, onClose }) {
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
          {attendees.map((a, i) => {
            const name = a.name || a.email || 'Unknown'
            const showEmail = a.email && a.email !== name
            return (
              <li key={i} className="attendees-list-item">
                <AttendeeAvatar attendee={a} />
                <div className="attendee-list-info">
                  <div className="attendee-list-name">{name}</div>
                  {showEmail && <div className="attendee-tooltip-email">{a.email}</div>}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default function AttendeeGroup({ label, attendees, colorClass }) {
  const [showModal, setShowModal] = useState(false)

  if (!attendees || attendees.length === 0) return null

  const visible = attendees.slice(0, 5)
  const overflow = attendees.length - 5

  return (
    <>
      <div className="attendee-group">
        <span className={`attendee-group-label ${colorClass}`}>{label}</span>
        <div className="attendee-avatar-stack">
          {visible.map((a, i) => (
            <AttendeeAvatar key={i} attendee={a} />
          ))}
          {overflow > 0 && (
            <button
              className="attendee-avatar attendee-avatar-more"
              onClick={() => setShowModal(true)}
            >
              +{overflow}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <AttendeesModal
          label={label}
          attendees={attendees}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
