import EventCard from './EventCard'

export default function Dashboard({ events, rsvps, rsvpAttendees, onRsvp, onCreateEvent, userId, onEdit }) {
  const today = new Date().toISOString().split('T')[0]
  const sorted = [...events].sort((a, b) => (a.date > b.date ? 1 : -1))
  const upcoming = sorted.filter(e => e.date >= today)
  const past = sorted.filter(e => e.date < today)

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Upcoming events</h1>
        <button className="btn-outline" onClick={onCreateEvent}>+ New event</button>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state">
          <p>No upcoming events.</p>
          <button className="btn-outline" onClick={onCreateEvent}>Create one</button>
        </div>
      ) : (
        <div className="event-list">
          {upcoming.map(event => (
            <EventCard
              key={event.id}
              event={event}
              rsvpStatus={rsvps[event.id]}
              rsvpAttendees={rsvpAttendees[event.id]}
              onRsvp={onRsvp}
              showHost
              onEdit={event.host_id === userId ? onEdit : undefined}
            />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <p className="section-label">Past</p>
          <div className="event-list past">
            {past.map(event => (
              <EventCard
                key={event.id}
                event={event}
                rsvpStatus={rsvps[event.id]}
                rsvpAttendees={rsvpAttendees[event.id]}
                onRsvp={onRsvp}
              />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
