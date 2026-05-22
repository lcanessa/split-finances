import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppProvider'
import { AuthProvider } from './context/AuthProvider'
import { useApp } from './hooks/useApp'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { Spinner } from './components/ui/Spinner'
import { CreditPurchases } from './pages/CreditPurchases/CreditPurchases'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Expenses } from './pages/Expenses/Expenses'
import { Login } from './pages/Login/Login'
import { SelectUser } from './pages/SelectUser/SelectUser'
import { SetupUsers } from './pages/SetupUsers/SetupUsers'
import { Settings } from './pages/Settings/Settings'

function AuthenticatedApp() {
  const { users, activeUser, loading, error } = useApp()

  if (loading) {
    return <Spinner label="Cargando datos..." />
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="font-medium text-red-700">Error al cargar datos</p>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <p className="mt-4 text-xs text-slate-500">
            Verificá que ejecutaste las políticas RLS para el rol{' '}
            <code>authenticated</code> y que tu sesión sigue activa.
          </p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return <SetupUsers />
  }

  if (!activeUser) {
    return <SelectUser />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="gastos" element={<Expenses />} />
        <Route path="creditos" element={<CreditPurchases />} />
        <Route path="configuracion" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Spinner label="Verificando sesión..." />
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
