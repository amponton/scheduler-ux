import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import CreateEventModal from './components/CreateEventModal'
import Settings from './components/Settings'
import { supabase } from './supabase'
import { getProfile, saveProfile } from './lib/profiles'
import { getEvents, createEvent } from './lib/events'
import { getRsvps, upsertRsvp, deleteRsvp } from './lib/rsvps'

function profileToSettings(profile) {
  return {
    name: profile.name ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    timezone: profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    contacts: profile.contacts ?? [],
    notifications: profile.notifications ?? { remindVia: [], rsvpVia: [] },
  }
}


export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('landing')
  const [prevView, setPrevView] = useState('dashboard')
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [settings, setSettings] = useState(null)

  async function loadProfile(authUser) {
    try {
      const profile = await getProfile(authUser.id)
      setSettings(profileToSettings(profile))
    } catch {
      setSettings(profileToSettings({ name: authUser.user_metadata?.full_name, email: authUser.email }))
    }
  }

  async function loadEvents() {
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (e) {
      console.error('Failed to load events', e)
    }
  }

  async function loadRsvps(authUser) {
    try {
      const data = await getRsvps(authUser.id)
      setRsvps(data)
    } catch (e) {
      console.error('Failed to load rsvps', e)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user)
        loadEvents()
        loadRsvps(session.user)
        setView('dashboard')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user)
        loadEvents()
        loadRsvps(session.user)
        setView('dashboard')
      } else {
        setUser(null)
        setSettings(null)
        setEvents([])
        setView('landing')
        setRsvps({})
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function navigate(next) {
    setPrevView(view)
    setView(next)
  }

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function handleRsvp(eventId, status) {
    const current = rsvps[eventId]
    const next = current === status ? undefined : status

    setRsvps(prev => ({ ...prev, [eventId]: next }))

    try {
      if (next) {
        await upsertRsvp(user.id, eventId, next)
      } else {
        await deleteRsvp(user.id, eventId)
      }
    } catch (e) {
      console.error('Failed to save rsvp', e)
      setRsvps(prev => ({ ...prev, [eventId]: current }))
    }
  }

  async function handleCreateEvent(data) {
    try {
      const event = await createEvent(user.id, settings?.name || 'You', data)
      setEvents(prev => [...prev, event])
    } catch (e) {
      console.error('Failed to create event', e)
    }
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
      {view === 'settings' && settings && (
        <Settings
          settings={settings}
          onSave={async (updated) => {
            setSettings(updated)
            await saveProfile(user.id, updated)
          }}
          onCancel={() => navigate(prevView)}
        />
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
