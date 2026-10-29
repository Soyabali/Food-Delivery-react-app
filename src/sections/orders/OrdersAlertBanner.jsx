import { Clock, RefreshCw, Zap } from 'lucide-react'

/** Live summary strip above the orders table (from /admin/stats). */
export function OrdersAlertBanner({ stats }) {
  const waiting = stats?.ordersByStatus?.placed ?? 0
  const active = stats?.activeOrders ?? 0
  return (
    <div className="flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-sm">
      <div className="flex items-center gap-space-md">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary">
          <Zap className="size-[18px]" aria-hidden="true" />
        </span>
        <div>
          <p className="flex items-center gap-space-xs text-label-lg text-on-surface">
            {active ? `${active} active ${active === 1 ? 'order' : 'orders'} in the pipeline` : 'All quiet — no active orders'}
            {active > 0 && <span className="ml-1 inline-block size-2 animate-ping rounded-full bg-primary" aria-hidden="true" />}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {stats ? `${stats.ordersToday} orders placed today across ${stats.totalRestaurants} restaurants.` : 'Loading live figures…'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-space-md text-label-md text-on-surface-variant">
        <span className="flex items-center gap-space-xs">
          <Clock className="size-4 text-primary" aria-hidden="true" />
          Waiting for kitchen: <strong className="text-on-surface">{waiting}</strong>
        </span>
        <span className="hidden h-4 w-px bg-surface-variant sm:block" />
        <span className="flex items-center gap-space-xs">
          <RefreshCw className="size-4 text-primary-container" aria-hidden="true" />
          Auto-refresh: <span className="text-label-lg text-on-surface">every 30s</span>
        </span>
      </div>
    </div>
  )
}
