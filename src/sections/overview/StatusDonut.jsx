import { Card, CardHeader } from '@/components/ui/card'
import { ORDER_STATUS, ORDER_STATUSES } from '@/lib/orderStatus'
import { cn } from '@/lib/utils'

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** All-time order mix from /admin/stats `ordersByStatus`. */
export function StatusDonut({ ordersByStatus, className }) {
  const rows = ORDER_STATUSES.map((id) => ({ id, ...ORDER_STATUS[id], count: ordersByStatus[id] ?? 0 }))
  const total = rows.reduce((sum, s) => sum + s.count, 0)
  const delivered = ordersByStatus.delivered ?? 0
  const fulfilled = total ? ((delivered / total) * 100).toFixed(1) : '0.0'

  // Each arc starts where the previous ones end.
  const segments = rows.map((s, i) => ({
    ...s,
    length: total ? (s.count / total) * CIRCUMFERENCE : 0,
    offset: total ? (rows.slice(0, i).reduce((sum, p) => sum + p.count, 0) / total) * CIRCUMFERENCE : 0,
  }))

  return (
    <Card className={cn('flex flex-col p-space-lg', className)}>
      <CardHeader
        title="Orders by Status"
        className="mb-space-md"
        action={<span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface">{total} TOTAL</span>}
      />

      <div className="relative my-space-md flex items-center justify-center">
        <svg className="size-44 -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`${fulfilled}% of orders delivered`}>
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#EFF3FF" strokeWidth="12" />
          {segments
            .filter((s) => s.length > 0)
            .map((s) => (
              <circle
                key={s.id}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke={s.chart}
                strokeWidth="12"
                strokeDasharray={`${s.length} ${CIRCUMFERENCE}`}
                strokeDashoffset={-s.offset}
              />
            ))}
        </svg>
        <div className="pointer-events-none absolute flex flex-col items-center text-center">
          <span className="tabular font-display text-headline-lg text-on-surface">{total ? `${fulfilled}%` : '—'}</span>
          <span className="text-label-sm text-success uppercase">{total ? 'Delivered' : 'No orders yet'}</span>
        </div>
      </div>

      <ul className="space-y-2 pt-2">
        {rows.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-space-sm py-1 text-body-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: s.chart }} />
              <span className="truncate font-medium text-on-surface">{s.label}</span>
            </div>
            <span className="tabular shrink-0 text-label-md text-on-surface">
              {s.count} ({total ? Math.round((s.count / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
