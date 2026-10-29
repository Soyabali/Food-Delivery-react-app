import { CalendarDays, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { IconInput } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/select'
import { ORDER_STATUS } from '@/lib/orderStatus'
import { cn } from '@/lib/utils'

const tabs = ['all', 'placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

const countStyles = {
  placed: 'bg-surface-container text-on-surface',
  preparing: 'bg-secondary-fixed text-primary',
  out_for_delivery: 'bg-warning-container text-warning',
  delivered: 'bg-success-container text-success',
  cancelled: 'bg-error-container text-tertiary',
}

const DATE_RANGES = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

/** counts: all-time totals per status (from /admin/stats). */
export function OrdersFilterBar({ filters, onChange, counts, restaurants }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })
  const allCount = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <Card className="space-y-space-md p-space-md">
      <div role="tablist" aria-label="Order status" className="no-scrollbar -mx-space-md flex items-center gap-1.5 overflow-x-auto px-space-md">
        {tabs.map((tab) => {
          const active = filters.status === tab
          const meta = ORDER_STATUS[tab]
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => set('status')(tab)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-space-md py-1.5 text-label-lg whitespace-nowrap transition-colors',
                active ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
              )}
            >
              {meta?.live && <span className={cn('size-1.5 animate-pulse rounded-full', active ? 'bg-white' : meta.dot)} />}
              {tab === 'all' ? 'All' : meta.label}
              <span className={cn('rounded-full px-1.5 text-label-sm', active ? 'bg-white/20 text-on-primary' : (countStyles[tab] ?? 'bg-surface-container text-on-surface'))}>
                {tab === 'all' ? allCount : (counts[tab] ?? 0)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-space-sm md:flex-row md:items-center">
        <IconInput
          icon={Search}
          className="flex-1"
          inputClassName="bg-surface text-body-sm"
          value={filters.q}
          onChange={(e) => set('q')(e.target.value)}
          placeholder="Search by order number, customer name or email…"
          aria-label="Search orders"
        />
        <div className="flex items-center gap-space-sm">
          <NativeSelect
            className="min-w-0 flex-1 md:w-[210px] md:flex-none"
            selectClassName="bg-surface"
            options={[{ value: '', label: 'All Restaurants' }, ...restaurants.map((r) => ({ value: String(r.id), label: r.name }))]}
            value={filters.restaurantId}
            onChange={(e) => set('restaurantId')(e.target.value)}
            aria-label="Filter by restaurant"
          />
          <div className="relative min-w-0 flex-1 md:w-44 md:flex-none">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-space-md z-10 size-4 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
            <NativeSelect
              selectClassName="bg-surface pl-9"
              options={DATE_RANGES}
              value={filters.range}
              onChange={(e) => set('range')(e.target.value)}
              aria-label="Date range"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
