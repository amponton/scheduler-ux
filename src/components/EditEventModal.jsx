import { useState } from 'react'
import ImagePicker from './ImagePicker'

export default function EditEventModal({ event, onClose, onSave, userId }) {
  const [form, setForm] = useState({
    title: event.title ?? '',
    date: event.date ?? '',
    time: event.time ?? '',
    location: event.location ?? '',
    description: event.description ?? '',
    attendees: event.attendees ?? [],
    image_url: event.image_url ?? null,
  })
  const [newInvitee, setNewInvitee] = useState({ name: '', email: '' })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function addInvitee() {
    if (!newInvitee.name.trim() || !newInvitee.email.trim()) return
    setForm(prev => ({ ...prev, attendees: [...prev.attendees, { ...newInvitee }] }))
    setNewInvitee({ name: '', email: '' })
  }

  function removeInvitee(i) {
    setForm(prev => ({ ...prev, attendees: prev.attendees.filter((_, idx) => idx !== i) }))
  }

  function updateInvitee(i, field, value) {
    setForm(prev => ({
      ...prev,
      attendees: prev.attendees.map((inv, idx) => idx === i ? { ...inv, [field]: value } : inv),
    }))
  }

  function handleInviteeKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); addInvitee() }
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
      attendees: form.attendees,
      image_url: form.image_url,
    })
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal modal-wide">
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

          <div className="form-label">
            Event image
            <ImagePicker
              value={form.image_url}
              onChange={val => setForm(prev => ({ ...prev, image_url: val }))}
              userId={userId}
            />
          </div>

          <div className="form-label">
            Invitees
            {form.attendees.length > 0 && (
              <div className="invitee-list">
                {form.attendees.map((inv, i) => (
                  <div key={i} className="invitee-row">
                    <input
                      className="form-input invitee-input"
                      value={inv.name}
                      onChange={e => updateInvitee(i, 'name', e.target.value)}
                      placeholder="Name"
                    />
                    <input
                      className="form-input invitee-input"
                      type="email"
                      value={inv.email}
                      onChange={e => updateInvitee(i, 'email', e.target.value)}
                      placeholder="Email"
                    />
                    <button
                      type="button"
                      className="invitee-remove"
                      onClick={() => removeInvitee(i)}
                      aria-label="Remove invitee"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="invitee-add-row">
              <input
                className="form-input"
                value={newInvitee.name}
                onChange={e => setNewInvitee(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={handleInviteeKeyDown}
                placeholder="Name"
              />
              <input
                className="form-input"
                type="email"
                value={newInvitee.email}
                onChange={e => setNewInvitee(prev => ({ ...prev, email: e.target.value }))}
                onKeyDown={handleInviteeKeyDown}
                placeholder="Email"
              />
              <button type="button" className="btn-outline" onClick={addInvitee}>
                Add
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-outline">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}
