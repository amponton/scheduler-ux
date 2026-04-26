import { useState } from 'react'
import EventDetailModal from './EventDetailModal'
import { getEventBackground } from './EventImage'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ events, rsvps, rsvpAttendees, onRsvp, userId, onEdit, onDelete }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedEvent, setSelectedEvent] = useState(null)

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function eventsOnDay(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const isToday = day =>
    day &&
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()

  return (
    <main className="calendar-view">
      <div className="calendar-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>←</button>
        <span className="cal-month-label">{monthLabel}</span>
        <button className="cal-nav-btn" onClick={nextMonth}>→</button>
      </div>

      <div className="calendar-grid">
        {DOW.map(d => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {cells.map((day, i) => {
          const dayEvents = day ? eventsOnDay(day) : []
          return (
            <div
              key={i}
              className={`cal-day${!day ? ' cal-day-empty' : ''}${isToday(day) ? ' cal-day-today' : ''}`}
            >
              {day && (
                <>
                  <span className="cal-day-num">{day}</span>
                  {dayEvents.map(e => {
                    const bg = getEventBackground(e.image_url)
                    const chipStyle = { cursor: 'pointer' }
                    if (bg?.type === 'preset') chipStyle.background = bg.bg
                    return (
                      <div
                        key={e.id}
                        className={`cal-event-chip${!bg?.type && rsvps[e.id] ? ` rsvp-${rsvps[e.id]}` : ''}`}
                        title={e.title}
                        onClick={() => setSelectedEvent(e)}
                        style={chipStyle}
                      >
                        {e.title}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )
        })}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          rsvpStatus={rsvps[selectedEvent.id]}
          rsvpAttendees={rsvpAttendees[selectedEvent.id]}
          onRsvp={(id, status) => { onRsvp(id, status); setSelectedEvent(null) }}
          onClose={() => setSelectedEvent(null)}
          onEdit={selectedEvent.host_id === userId ? onEdit : undefined}
          onDelete={selectedEvent.host_id === userId ? onDelete : undefined}
        />
      )}
    </main>
  )
}
