import { useState } from 'react'

export default function EditEventModal({ event, onClose, onSave }) {
  const [form, setForm] = useState({
    title: event.title ?? '',
    date: event.date ?? '',
    time: event.time ?? '',
    location: event.location ?? '',
    description: event.description ?? '',
    attendees: (event.attendees ?? []).join(', '),
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.date) return
    onSave(event.id, {
      title: form.title,
      date: form.date,
      time: form.time,
      location: form.location,
      description: form.description,
      attendees: form.attendees.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit event</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Title
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </label>

          <div className="form-row">
            <label className="form-label">
              Date
              <input
                className="form-input"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>
            <label className="form-label">
              Time
              <input
                className="form-input"
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="form-label">
            Location
            <input
              className="form-input"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Where?"
            />
          </label>

          <label className="form-label">
            Description
            <textarea
              className="form-input form-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label className="form-label">
            Invite (comma-separated)
            <input
              className="form-input"
              name="attendees"
              value={form.attendees}
              onChange={handleChange}
              placeholder="Sam, Morgan, Chris…"
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-outline">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}
