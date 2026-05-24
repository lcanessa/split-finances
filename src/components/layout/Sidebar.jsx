import { NavLink, useLocation } from 'react-router-dom'
import { MAIN_NAV_ITEMS } from '../../lib/navigation'

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
      <nav className="space-y-1 p-4">
        {MAIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to || pathname.startsWith(`${to}/`)
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
