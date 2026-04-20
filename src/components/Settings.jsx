import { useState, useRef, useEffect } from 'react'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
]

const REMIND_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text Message' },
]

const RSVP_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text Message' },
]

function MultiSelect({ options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggle(value) {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    )
  }

  const label = selected.length === 0
    ? 'None'
    : options.filter(o => selected.includes(o.value)).map(o => o.label).join(', ')

  return (
    <div className="multiselect" ref={ref}>
      <button type="button" className="multiselect-trigger" onClick={() => setOpen(o => !o)}>
        <span>{label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="multiselect-dropdown">
          {options.map(opt => (
            <label key={opt.value} className="multiselect-option">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Settings({ settings, onSave, onCancel }) {
  const [form, setForm] = useState(settings)
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' })

  const isDirty = JSON.stringify(form) !== JSON.stringify(settings)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function setNotification(field, value) {
    setForm(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }))
  }

  function handleSave(e) {
    e.preventDefault()
    if (!isDirty) return
    onSave(form)
  }

  function addContact() {
    if (!newContact.name.trim()) return
    set('contacts', [...form.contacts, { ...newContact, id: Date.now() }])
    setNewContact({ name: '', email: '', phone: '' })
  }

  function removeContact(id) {
    set('contacts', form.contacts.filter(c => c.id !== id))
  }

  function updateContact(id, field, value) {
    set('contacts', form.contacts.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <section className="settings-section">
          <h2 className="settings-section-title">Profile</h2>
          <div className="settings-fields">
            <label className="form-label">
              Name
              <input
                className="form-input"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="form-label">
              Email address
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="form-label">
              Phone number
              <input
                className="form-input"
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </label>
            <label className="form-label">
              Timezone
              <select
                className="form-input"
                value={form.timezone}
                onChange={e => set('timezone', e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">Contacts</h2>
          <p className="settings-section-desc">People you frequently invite to events.</p>

          {form.contacts.length > 0 && (
            <div className="contact-list">
              {form.contacts.map(contact => (
                <div key={contact.id} className="contact-row">
                  <input
                    className="form-input contact-input"
                    value={contact.name}
                    onChange={e => updateContact(contact.id, 'name', e.target.value)}
                    placeholder="Name"
                  />
                  <input
                    className="form-input contact-input"
                    type="email"
                    value={contact.email}
                    onChange={e => updateContact(contact.id, 'email', e.target.value)}
                    placeholder="Email"
                  />
                  <input
                    className="form-input contact-input"
                    type="tel"
                    value={contact.phone}
                    onChange={e => updateContact(contact.id, 'phone', e.target.value)}
                    placeholder="Phone"
                  />
                  <button
                    type="button"
                    className="contact-remove"
                    onClick={() => removeContact(contact.id)}
                    aria-label="Remove contact"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="contact-add-row">
            <input
              className="form-input contact-input"
              value={newContact.name}
              onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Name"
            />
            <input
              className="form-input contact-input"
              type="email"
              value={newContact.email}
              onChange={e => setNewContact(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
            />
            <input
              className="form-input contact-input"
              type="tel"
              value={newContact.phone}
              onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone"
            />
            <button type="button" className="btn-outline contact-add-btn" onClick={addContact}>
              Add
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">Notifications</h2>
          <div className="settings-fields">
            <div className="notification-row">
              <div>
                <span className="notification-label">Reminder</span>
                <p className="notification-sublabel">Remind me of upcoming events I may be attending</p>
              </div>
              <MultiSelect
                options={REMIND_OPTIONS}
                selected={form.notifications.remindVia}
                onChange={val => setNotification('remindVia', val)}
              />
            </div>
            <div className="notification-row">
              <div>
                <span className="notification-label">RSVP</span>
                <p className="notification-sublabel">Notify me when someone responds to my event</p>
              </div>
              <MultiSelect
                options={RSVP_OPTIONS}
                selected={form.notifications.rsvpVia}
                onChange={val => setNotification('rsvpVia', val)}
              />
            </div>
          </div>
        </section>

        <div className="settings-footer">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-outline settings-save" disabled={!isDirty}>
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}
