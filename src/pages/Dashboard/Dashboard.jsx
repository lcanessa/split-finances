import { ArrowRightLeft, CalendarDays, Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../hooks/useApp'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Card } from '../../components/ui/Card'

const quickLinks = [
  {
    to: '/gastos',
    label: 'Registrar gasto',
    description: 'Gastos del día o fijos del mes',
    icon: Receipt,
  },
  {
    to: '/creditos',
    label: 'Compra en cuotas',
    description: 'Cargar compra con tarjeta',
    icon: CalendarDays,
  },
  {
    to: '/configuracion',
    label: 'Sueldos del mes',
    description: 'Definir ingresos de cada uno',
    icon: ArrowRightLeft,
  },
]

export function Dashboard() {
  const { activeUser } = useApp()

  return (
    <PageWrapper
      title={`Hola, ${activeUser?.name?.split(' ')[0] ?? 'equipo'}`}
      description="Resumen del mes — próximamente con datos reales desde Supabase."
    >
      <Card className="border-indigo-100 bg-indigo-50/50">
        <p className="text-sm text-indigo-900">
          El dashboard con balances y gastos compartidos se implementa en el próximo paso.
          Por ahora ya podés navegar por las secciones y cambiar de usuario cuando quieras.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(({ to, label, description, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <Icon className="mb-3 h-5 w-5 text-indigo-600" />
              <p className="font-medium text-slate-900">{label}</p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </PageWrapper>
  )
}
