export default function Nav({ user, view, onNavigate, onSignIn, onSignOut, onCreateEvent }) {
  return (
    <nav className="nav">
      <button className="nav-logo" onClick={() => onNavigate(user ? 'dashboard' : 'landing')}>
        gather
      </button>
      <div className="nav-actions">
        {user ? (
          <>
            <button
              className={`nav-link${view === 'dashboard' ? ' active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              Events
            </button>
            <button
              className={`nav-link${view === 'calendar' ? ' active' : ''}`}
              onClick={() => onNavigate('calendar')}
            >
              Calendar
            </button>
            <button className="btn-outline" onClick={onCreateEvent}>
              + New event
            </button>
            <button
              className={`nav-link${view === 'settings' ? ' active' : ''}`}
              onClick={() => onNavigate('settings')}
            >
              Settings
            </button>
            <button className="nav-link" onClick={onSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <button className="btn-outline" onClick={onSignIn}>Sign in</button>
            <button className="btn-outline" onClick={onSignIn}>Get started</button>
          </>
        )}
      </div>
    </nav>
  )
}
