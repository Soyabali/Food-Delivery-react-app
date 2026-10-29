import { ArrowUp, IndianRupee, Store, Timer, UtensilsCrossed } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function KpiTile({ label, icon: Icon, children }) {
  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden p-space-lg">
      <span className="absolute -top-3 -right-3 size-16 rounded-full bg-surface-container-low transition-transform group-hover:scale-125" />
      <div className="relative flex items-center justify-between">
        <span className="text-label-md tracking-wider text-on-surface-variant uppercase">{label}</span>
        <span className="flex items-center justify-center rounded-lg bg-surface-container p-space-xs text-primary">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      {children}
    </Card>
  )
}

const pill = 'inline-flex items-center rounded-full bg-success-container px-1.5 py-0.5 text-label-sm text-success'
const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0)

/** Figures derived from the restaurant list itself. */
export function PartnerKpis({ restaurants }) {
  const total = restaurants.length
  const active = restaurants.filter((r) => r.isActive)
  const pct = total ? (active.length / total) * 100 : 0
  const avgEta = average(active.map((r) => (r.deliveryTimeMin + r.deliveryTimeMax) / 2))
  const avgCost = average(active.map((r) => r.costForOne))
  const dishes = restaurants.reduce((sum, r) => sum + r.menuItemCount, 0)
  const freeDelivery = active.filter((r) => !r.deliveryFee).length

  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
      <KpiTile label="Live Outlets" icon={Store}>
        <div className="mt-space-md flex flex-wrap items-baseline gap-space-sm">
          <span className="tabular font-display text-metric-display text-on-surface">
            {active.length}
            <span className="text-headline-sm text-on-surface-variant">/{total}</span>
          </span>
          <span className={pill}>
            <ArrowUp className="mr-0.5 size-3" aria-hidden="true" />
            {pct.toFixed(0)}% live
          </span>
        </div>
        <div className="mt-space-sm h-1 w-full overflow-hidden rounded-full bg-surface-container">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </KpiTile>

      <KpiTile label="Avg Delivery Time" icon={Timer}>
        <span className="tabular mt-space-md font-display text-metric-display text-on-surface">
          {avgEta.toFixed(0)} <span className="font-sans text-body-sm font-normal text-on-surface-variant">mins</span>
        </span>
        <p className="mt-space-sm text-body-sm text-on-surface-variant">Average promise across live outlets</p>
      </KpiTile>

      <KpiTile label="Avg Cost for One" icon={IndianRupee}>
        <span className="tabular mt-space-md font-display text-metric-display text-on-surface">₹{avgCost.toFixed(0)}</span>
        <p className={cn('mt-space-sm text-body-sm text-on-surface-variant')}>{freeDelivery} outlets offer free delivery</p>
      </KpiTile>

      <KpiTile label="Dishes Listed" icon={UtensilsCrossed}>
        <span className="tabular mt-space-md font-display text-metric-display text-on-surface">{dishes}</span>
        <p className="mt-space-sm text-body-sm text-on-surface-variant">
          {total ? (dishes / total).toFixed(1) : 0} per restaurant on average
        </p>
      </KpiTile>
    </div>
  )
}
