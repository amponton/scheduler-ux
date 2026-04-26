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

  const prevY = month === 0 ? year - 1 : year
  const prevM = month === 0 ? 11 : month - 1
  const daysInPrevMonth = new Date(prevY, prevM + 1, 0).getDate()

  const nextY = month === 11 ? year + 1 : year
  const nextM = month === 11 ? 0 : month + 1

  const leadingCells = Array.from({ length: firstDow }, (_, i) => ({
    day: daysInPrevMonth - firstDow + 1 + i, year: prevY, month: prevM, current: false,
  }))
  const currentCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1, year, month, current: true,
  }))
  const trailingCount = (leadingCells.length + currentCells.length) % 7
  const trailingCells = trailingCount === 0 ? [] : Array.from({ length: 7 - trailingCount }, (_, i) => ({
    day: i + 1, year: nextY, month: nextM, current: false,
  }))

  const cells = [...leadingCells, ...currentCells, ...trailingCells]

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function eventsOnDay(y, m, d) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
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

  const isToday = cell =>
    cell.year === today.getFullYear() &&
    cell.month === today.getMonth() &&
    cell.day === today.getDate()

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
        {cells.map((cell, i) => {
          const dayEvents = eventsOnDay(cell.year, cell.month, cell.day)
          return (
            <div
              key={i}
              className={`cal-day${!cell.current ? ' cal-day-empty' : ''}${isToday(cell) ? ' cal-day-today' : ''}`}
            >
              <span className={`cal-day-num${!cell.current ? ' cal-day-num-overflow' : ''}`}>
                {cell.day}
              </span>
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
