import { ArrowDownRight, ArrowUpRight, Store, TrendingDown, TrendingUp, UtensilsCrossed } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { LiveDot } from '@/components/shared/PageHeader'
import { cn, formatINR } from '@/lib/utils'

function KpiLabel({ children, className = 'text-on-surface-variant' }) {
  return <span className={`text-label-sm tracking-wider uppercase ${className}`}>{children}</span>
}

function KpiValue({ children, className = 'text-on-surface' }) {
  return <div className={`tabular mt-1 font-display text-headline-xl ${className}`}>{children}</div>
}

function Delta({ value, onBrand = false }) {
  if (value == null) return null
  const up = value >= 0
  const Icon = onBrand ? (up ? TrendingUp : TrendingDown) : up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-label-sm',
        onBrand ? 'bg-white/20 backdrop-blur-sm' : up ? 'bg-success-container text-success' : 'bg-tertiary-fixed text-tertiary',
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" /> {up ? '+' : ''}
      {value.toFixed(1)}%
    </span>
  )
}

/**
 * stats: /admin/stats · today/yesterday: { revenue, orders } from the daily series.
 */
export function OverviewKpis({ stats, today, yesterday, revenueDelta, ordersDelta }) {
  const { placed = 0, preparing = 0, out_for_delivery: out = 0 } = stats.ordersByStatus

  return (
    <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 xl:grid-cols-4">
      <div className="relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-xl bg-brand-gradient p-space-lg text-on-primary shadow-md">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="min-w-0">
            <KpiLabel className="text-white/80">Revenue Today</KpiLabel>
            <KpiValue className="text-white">{formatINR(stats.revenueToday)}</KpiValue>
          </div>
          <Delta value={revenueDelta} onBrand />
        </div>
        <span className="mt-4 text-body-sm text-white/80">
          vs {formatINR(yesterday.revenue, { decimals: false })} yesterday · excludes cancelled
        </span>
      </div>

      <Card className="flex min-h-[160px] flex-col justify-between p-space-lg">
        <div className="flex items-start justify-between">
          <div>
            <KpiLabel>Orders Today</KpiLabel>
            <KpiValue>{stats.ordersToday}</KpiValue>
          </div>
          <Delta value={ordersDelta} />
        </div>
        <p className="pt-3 text-body-sm text-on-surface-variant">
          {yesterday.orders} yesterday · {today.orders} counted toward revenue
        </p>
      </Card>

      <Card className="flex min-h-[160px] flex-col justify-between p-space-lg">
        <div className="flex items-start justify-between">
          <div>
            <KpiLabel>Active Orders</KpiLabel>
            <KpiValue className="flex items-center gap-2 text-on-surface">
              {stats.activeOrders}
              {stats.activeOrders > 0 && <LiveDot className="size-3" />}
            </KpiValue>
          </div>
          <span className="rounded bg-secondary-fixed px-2 py-1 text-label-sm text-primary">LIVE</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-3 text-body-sm font-medium">
          <span className="inline-flex items-center gap-1 text-on-surface-variant">
            <span className="size-2 rounded-full bg-surface-container-highest" />
            {placed} Placed
          </span>
          <span className="text-surface-dim">·</span>
          <span className="inline-flex items-center gap-1 text-primary">
            <span className="size-2 rounded-full bg-secondary-container" />
            {preparing} Preparing
          </span>
          <span className="text-surface-dim">·</span>
          <span className="inline-flex items-center gap-1 text-warning">
            <span className="size-2 rounded-full bg-warning-container ring-1 ring-warning/30" />
            {out} Out
          </span>
        </div>
      </Card>

      <Card className="flex min-h-[160px] flex-col justify-between p-space-lg">
        <div>
          <KpiLabel>Customers</KpiLabel>
          <KpiValue>{stats.totalUsers.toLocaleString('en-IN')}</KpiValue>
        </div>
        <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 pt-3 text-body-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <Store className="size-4 text-primary" aria-hidden="true" /> {stats.totalRestaurants} restaurants
          </span>
          <span className="inline-flex items-center gap-1">
            <UtensilsCrossed className="size-4 text-primary" aria-hidden="true" /> {stats.totalMenuItems} dishes
          </span>
        </div>
      </Card>
    </div>
  )
}
