import { Flame, Soup } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn, formatINR } from '@/lib/utils'

/** Best sellers by quantity, from /admin/stats `topItems`. */
export function TopDishes({ items, className }) {
  const best = items[0]
  return (
    <Card className={cn('flex flex-col justify-between p-space-lg', className)}>
      <div>
        <CardHeader
          title="Top Dishes by Volume"
          action={
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">ALL TIME</span>
          }
        />
        {items.length === 0 ? (
          <EmptyState icon={Soup} title="No sales yet">
            Best-selling dishes appear here once customers start ordering.
          </EmptyState>
        ) : (
          <ol className="space-y-space-sm">
            {items.map((dish, index) => (
              <li
                key={`${dish.menuItemId}-${dish.name}`}
                className="flex items-center justify-between gap-space-sm rounded-lg p-2 transition-colors hover:bg-surface-container-low"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-container text-label-sm text-on-surface-variant">
                    {index + 1}
                  </span>
                  <span className="truncate text-label-lg text-on-surface">{dish.name}</span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="tabular text-label-lg font-bold text-on-surface">{formatINR(dish.revenue, { decimals: false })}</div>
                  <div className={cn('text-label-sm', index === 0 ? 'text-primary' : 'text-on-surface-variant')}>{dish.quantity} sold</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {best && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-space-sm rounded-lg bg-surface-container p-space-md">
          <div className="flex items-center gap-2 text-label-md text-on-surface">
            <Flame className="size-[18px] text-primary" aria-hidden="true" />
            Best seller: <strong>{best.name}</strong>
          </div>
          <span className="text-label-sm text-primary">{formatINR(best.revenue, { decimals: false })} revenue</span>
        </div>
      )}
    </Card>
  )
}
