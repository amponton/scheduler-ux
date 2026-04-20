import { useState } from 'react'
import Nav from './components/Nav'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import CreateEventModal from './components/CreateEventModal'
import Settings from './components/Settings'

const DEMO_USER = { name: 'Alex', email: 'alex@example.com' }

const DEFAULT_SETTINGS = {
  name: DEMO_USER.name,
  email: DEMO_USER.email,
  phone: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  contacts: [],
}

const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'Rooftop dinner',
    date: '2026-04-25',
    time: '7:00 PM',
    location: 'The Penthouse, 5th Ave',
    description: 'Casual dinner to catch up. Bring your appetite.',
    host: 'Jamie',
    attendees: ['Jamie', 'Sam', 'Chris', 'Morgan'],
    responses: { going: ['Sam', 'Chris'], maybe: ['Morgan'], cant: [] },
  },
  {
    id: 2,
    title: 'Board game night',
    date: '2026-05-03',
    time: '6:30 PM',
    location: "Jamie's place",
    description: 'Settlers of Catan and more. BYOB.',
    host: 'Jamie',
    attendees: ['Jamie', 'Sam', 'Chris', 'Morgan', 'Riley'],
    responses: { going: ['Jamie', 'Riley'], maybe: ['Chris'], cant: ['Morgan'] },
  },
  {
    id: 3,
    title: 'Hiking trip',
    date: '2026-05-10',
    time: '8:00 AM',
    location: 'Muir Woods',
    description: 'About 5 miles round trip, moderate difficulty. Pack snacks.',
    host: 'Sam',
    attendees: ['Sam', 'Alex', 'Chris'],
    responses: { going: ['Sam'], maybe: [], cant: [] },
  },
]

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('landing')
  const [prevView, setPrevView] = useState('dashboard')
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [rsvps, setRsvps] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  function navigate(next) {
    setPrevView(view)
    setView(next)
  }

  function signIn() {
    setUser(DEMO_USER)
    setView('dashboard')
  }

  function signOut() {
    setUser(null)
    setView('landing')
    setRsvps({})
  }

  function handleRsvp(eventId, status) {
    setRsvps(prev => ({
      ...prev,
      [eventId]: prev[eventId] === status ? undefined : status,
    }))
  }

  function handleCreateEvent(data) {
    setEvents(prev => [
      ...prev,
      {
        id: Date.now(),
        ...data,
        host: user?.name ?? 'You',
        responses: { going: [], maybe: [], cant: [] },
      },
    ])
    setShowCreateModal(false)
  }

  return (
    <>
      <Nav
        user={user}
        view={view}
        onNavigate={navigate}
        onSignIn={signIn}
        onSignOut={signOut}
        onCreateEvent={() => setShowCreateModal(true)}
      />

      {view === 'landing' && <LandingPage onTryDemo={signIn} />}
      {view === 'dashboard' && (
        <Dashboard
          events={events}
          rsvps={rsvps}
          onRsvp={handleRsvp}
          onCreateEvent={() => setShowCreateModal(true)}
        />
      )}
      {view === 'calendar' && <CalendarView events={events} rsvps={rsvps} />}
      {view === 'settings' && (
        <Settings settings={settings} onSave={setSettings} onCancel={() => navigate(prevView)} />
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateEvent}
        />
      )}
    </>
  )
}
