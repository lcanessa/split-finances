export function ConfigGuard({ children }) {
  const missing = []
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')

  if (missing.length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Falta configuración</h1>
          <p className="mt-2 text-sm text-slate-600">
            En Netlify agregá estas variables de entorno y volvé a desplegar:
          </p>
          <ul className="mt-3 list-inside list-disc text-sm text-slate-700">
            {missing.map((key) => (
              <li key={key}>
                <code>{key}</code>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Site configuration → Environment variables → Add variable → Trigger deploy
          </p>
        </div>
      </div>
    )
  }

  return children
}
