import { CreditCard, Home, Receipt, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/creditos', label: 'Créditos', icon: CreditCard },
  { to: '/configuracion', label: 'Más', icon: Settings },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white px-2 py-2 md:hidden">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
              isActive ? 'text-indigo-700' : 'text-slate-500'
            }`
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
