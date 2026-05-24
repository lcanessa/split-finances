import { NavLink, useLocation } from 'react-router-dom'
import { MAIN_NAV_ITEMS } from '../../lib/navigation'

export function MobileNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white px-2 py-2 md:hidden">
      {MAIN_NAV_ITEMS.map(({ to, shortLabel, icon: Icon }) => {
        const isActive = pathname === to || pathname.startsWith(`${to}/`)
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
              isActive ? 'text-indigo-700' : 'text-slate-500'
            }`}
          >
            <Icon className="h-5 w-5" />
            {shortLabel}
          </NavLink>
        )
      })}
    </nav>
  )
}
