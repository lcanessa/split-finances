import { Link } from 'react-router-dom'
import { LogOut, Settings, UserRound, Wallet } from 'lucide-react'
import { useApp } from '../../hooks/useApp'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../../lib/utils'
import { Button } from '../ui/Button'

export function Header() {
  const { activeUser, clearActiveUser } = useApp()
  const { signOut, user: authUser } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Split Finances</p>
          <p className="hidden text-xs text-slate-500 sm:block">
            {authUser?.email ?? 'Finanzas en pareja'}
          </p>
        </div>
      </div>

      {activeUser && (
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {getInitials(activeUser.name)}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{activeUser.name}</p>
              <p className="text-xs text-slate-500">Perfil activo</p>
            </div>
          </div>

          <Link
            to="/configuracion"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            title="Configuración"
          >
            <Settings className="h-4 w-4" />
          </Link>

          <Button variant="ghost" size="sm" onClick={clearActiveUser} title="Cambiar perfil de la pareja">
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">Cambiar perfil</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={signOut} title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      )}
    </header>
  )
}
