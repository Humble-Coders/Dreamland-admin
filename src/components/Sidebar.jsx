import { memo } from 'react'
import { NavLink } from 'react-router-dom'
import { Hotel, PlusCircle, CalendarDays, Settings, X, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/hotels', label: 'Hotels', icon: Hotel },
  { to: '/add-hotel', label: 'Add Hotel', icon: PlusCircle },
  { to: '/opening-date', label: 'Opening Date', icon: CalendarDays },
  { to: '/app-settings', label: 'App Settings', icon: Settings },
]

function Sidebar({ open, onClose }) {
  const { user, signOut } = useAuth()

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-64 bg-brand-surface border-r border-brand-border
        flex flex-col z-40
        transition-transform duration-200
        lg:relative lg:translate-x-0 lg:shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="relative flex flex-col items-center text-center px-5 pt-6 pb-5 border-b border-brand-border">
        <img
          src="/dreamland-logo.png"
          alt="Dreamland"
          className="w-20 h-35 object-contain mb-2"
        />

        <h1 className="font-serif text-brand-gold text-xl font-bold leading-tight">Dreamland</h1>
        <p className="text-brand-muted text-xs tracking-widest uppercase mt-0.5">Admin Panel</p>
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-brand-muted hover:text-brand-gold p-1 rounded transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-100 ${
                isActive
                  ? 'bg-brand-card text-brand-gold border border-brand-border'
                  : 'text-brand-text hover:bg-brand-card hover:text-brand-gold border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-brand-gold' : 'text-brand-muted'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer — user info + sign out */}
      <div className="px-4 py-4 border-t border-brand-border space-y-3">
        {user && (
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-bg rounded-xl border border-brand-border">
            <div className="w-7 h-7 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center shrink-0">
              <span className="text-brand-gold text-xs font-semibold uppercase">
                {user.email?.[0] ?? 'A'}
              </span>
            </div>
            <p className="text-brand-muted text-xs truncate flex-1">{user.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-brand-muted hover:text-brand-error hover:bg-brand-error/10 border border-transparent hover:border-brand-error/30 text-sm transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
        <p className="text-brand-muted text-xs text-center leading-relaxed">
          © 2026 Dreamland Hotels
          <br />
          <span className="text-brand-gold/60">Premium Hospitality</span>
        </p>
      </div>
    </aside>
  )
}

export default memo(Sidebar)
