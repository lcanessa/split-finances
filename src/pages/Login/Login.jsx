import { useState } from 'react'
import { Lock, Mail, Wallet } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setSubmitting(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        const { user } = await signUp(email, password)
        if (user && !user.identities?.length) {
          setError('Este email ya está registrado. Probá iniciar sesión.')
          return
        }
        setSuccessMessage(
          'Cuenta creada. Si Supabase requiere confirmación por email, revisá tu bandeja antes de ingresar.',
        )
        setMode('login')
      }
    } catch (err) {
      setError(translateAuthError(err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Split Finances</h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'login'
              ? 'Iniciá sesión para acceder a tus finanzas en pareja.'
              : 'Creá una cuenta compartida para la pareja.'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="password"
              type="password"
              label="Contraseña"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            {successMessage && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {successMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                'Procesando...'
              ) : mode === 'login' ? (
                <>
                  <Lock className="h-4 w-4" />
                  Iniciar sesión
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Crear cuenta
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError(null)
                setSuccessMessage(null)
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
            </button>
          </p>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Creá el usuario en Supabase → Authentication → Users, o registrate acá.
        </p>
      </div>
    </div>
  )
}

function translateAuthError(message) {
  if (message?.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  if (message?.includes('Email not confirmed')) {
    return 'Confirmá tu email antes de iniciar sesión.'
  }
  return message ?? 'Ocurrió un error al autenticar.'
}
