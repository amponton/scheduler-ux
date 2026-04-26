import { useState, useRef, useEffect } from 'react'

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

export default function Nav({ user, avatarUrl, view, onNavigate, onSignIn, onSignOut, onCreateEvent }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function navigate(v) {
    onNavigate(v)
    setMenuOpen(false)
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? ''

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

            <div className="profile-menu" ref={menuRef}>
              <button
                className={`profile-btn${menuOpen || view === 'settings' ? ' active' : ''}`}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Profile menu"
                aria-expanded={menuOpen}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="nav-avatar-img" />
                  : displayName
                    ? <span className="nav-avatar-initials">{getInitials(displayName)}</span>
                    : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    )
                }
              </button>

              {menuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-name">{displayName}</div>
                  <button
                    className={`profile-dropdown-item${view === 'settings' ? ' active' : ''}`}
                    onClick={() => navigate('settings')}
                  >
                    Settings
                  </button>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item" onClick={() => { onSignOut(); setMenuOpen(false) }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className="btn-outline" onClick={onSignIn}>Sign in</button>
        )}
      </div>
    </nav>
  )
}
