import { ArrowRight, Inbox, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { LiveDot } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/shared/QueryState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useOrders } from '@/hooks/queries'
import { timeAgo } from '@/lib/format'
import { cn, formatINR } from '@/lib/utils'

const LIMIT = 5

export function LiveOrdersStream({ className }) {
  const { data, isPending, isError } = useOrders({ page: 1, pageSize: LIMIT })
  const orders = data?.items ?? []

  return (
    <Card className={cn('flex flex-col justify-between p-space-lg', className)}>
      <div>
        <CardHeader
          title="Live Orders Stream"
          action={
            <span className="flex items-center gap-2 text-label-sm text-on-surface-variant">
              <RefreshCw className="size-4 text-emerald-600" aria-hidden="true" /> Refreshes every 30s
            </span>
          }
        >
          <LiveDot />
        </CardHeader>

        {isPending ? (
          <div className="space-y-space-sm">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-body-md text-error">Couldn’t load recent orders.</p>
        ) : orders.length === 0 ? (
          <EmptyState icon={Inbox} title="No orders yet">
            Orders placed in the Apna Food app will stream here automatically.
          </EmptyState>
        ) : (
          <ul className="space-y-space-sm">
            {orders.map((order, index) => (
              <li key={order.id}>
                <Link
                  to={`/orders?order=${order.id}`}
                  className={cn(
                    'flex flex-col justify-between gap-3 rounded-lg bg-surface-bright p-space-md transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center',
                    index === 0 && 'shadow-[inset_4px_0_0_0_#FF6B35]',
                  )}
                >
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-label-md font-bold text-on-surface">#{order.orderNumber}</span>
                      <span className="truncate font-medium text-on-surface">{order.customerName}</span>
                    </div>
                    <span className="truncate text-body-sm text-on-surface-variant">
                      {order.restaurantName} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
                    <span className="tabular text-label-lg font-bold text-on-surface">{formatINR(order.total)}</span>
                    <StatusBadge status={order.status} />
                    <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">
                      {timeAgo(order.placedAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-4">
        <span className="text-body-sm text-on-surface-variant">Showing the latest {Math.min(LIMIT, orders.length)} orders</span>
        <Link to="/orders" className="group inline-flex items-center gap-1 text-label-md text-primary hover:text-on-primary-container">
          View all {data?.total ?? ''} orders
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}
