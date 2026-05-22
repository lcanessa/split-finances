import { PageWrapper } from '../../components/layout/PageWrapper'
import { Card } from '../../components/ui/Card'

export function CreditPurchases() {
  return (
    <PageWrapper
      title="Compras en cuotas"
      description="Compras con tarjeta y sus cuotas mensuales."
    >
      <Card>
        <p className="text-sm text-slate-600">
          Acá vas a registrar compras en cuotas y ver el detalle por mes.
          Lo implementamos en un paso posterior.
        </p>
      </Card>
    </PageWrapper>
  )
}
