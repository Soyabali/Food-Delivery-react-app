import { ChevronRight, Inbox, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { NativeSelect } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge, Tag } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/format'
import { ORDER_STATUS, PAYMENT_METHOD_LABEL, PAYMENT_STATUS } from '@/lib/orderStatus'
import { cn, formatINR } from '@/lib/utils'

const PAGE_SIZES = ['10', '20', '50']

function Payment({ order }) {
  const status = PAYMENT_STATUS[order.paymentStatus]
  return (
    <div className="flex items-center gap-1.5">
      <Tag className="px-2">{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</Tag>
      <Tag tone={status?.tone}>{status?.label ?? order.paymentStatus}</Tag>
    </div>
  )
}

const itemsLabel = (n) => `${n} ${n === 1 ? 'item' : 'items'}`

export function OrdersTable({ page, onPageChange, pageSize, onPageSizeChange, data, isFetching, selectedId, onSelect, hasFilters }) {
  const { items: orders, total } = data
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  if (total === 0) {
    return (
      <Card className="w-full p-space-xl">
        <EmptyState icon={Inbox} title={hasFilters ? 'No orders match these filters' : 'No orders yet'}>
          {hasFilters
            ? 'Try another status tab, restaurant, date range or search term.'
            : 'Orders placed from the Apna Food mobile app will appear here in real time.'}
        </EmptyState>
      </Card>
    )
  }

  return (
    <Card className={cn('flex w-full min-w-0 flex-1 flex-col overflow-hidden transition-opacity', isFetching && 'opacity-80')}>
      {/* Tablet & desktop: dense data table */}
      <div className="relative hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="h-9 bg-surface-container-low text-label-sm tracking-wider text-on-surface-variant uppercase">
              <th className="px-space-md">Order</th>
              <th className="px-space-md">Placed</th>
              <th className="px-space-md">Customer</th>
              <th className="px-space-md">Restaurant</th>
              <th className="px-space-md">Items</th>
              <th className="px-space-md text-right">Total</th>
              <th className="px-space-md">Payment</th>
              <th className="px-space-md">Status</th>
              <th className="w-12 px-space-md">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high/40 text-body-sm text-on-surface">
            {orders.map((order) => {
              const selected = order.id === selectedId
              const accent = ORDER_STATUS[order.status]?.accent
              return (
                <tr
                  key={order.id}
                  onClick={() => onSelect(order.id)}
                  aria-selected={selected}
                  className={cn(
                    'group h-14 cursor-pointer transition-colors hover:bg-surface-container-low',
                    selected ? 'bg-surface-container-low/70' : 'bg-surface-container-lowest',
                  )}
                >
                  <td className={cn('relative px-space-md text-label-lg whitespace-nowrap', selected ? 'text-primary' : 'group-hover:text-primary')}>
                    {(selected || accent) && <span className={cn('absolute inset-y-0 left-0 w-1', selected ? 'bg-primary-container' : accent)} />}
                    {/* Keyboard access to the row; the click bubbles up to the <tr>. */}
                    <button type="button" className="text-left">
                      #{order.orderNumber}
                    </button>
                  </td>
                  <td className="px-space-md whitespace-nowrap text-on-surface-variant">{formatDateTime(order.placedAt)}</td>
                  <td className="px-space-md">
                    <div className="text-label-lg whitespace-nowrap">{order.customerName}</div>
                    <div className="whitespace-nowrap text-on-surface-variant">{order.customerPhone ?? '—'}</div>
                  </td>
                  <td className="max-w-[160px] truncate px-space-md text-body-md" title={order.restaurantName}>
                    {order.restaurantName}
                  </td>
                  <td className="px-space-md whitespace-nowrap text-on-surface-variant">{itemsLabel(order.itemCount)}</td>
                  <td className="tabular px-space-md text-right font-display text-headline-sm whitespace-nowrap">{formatINR(order.total)}</td>
                  <td className="px-space-md whitespace-nowrap">
                    <Payment order={order} />
                  </td>
                  <td className="px-space-md">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-space-md text-on-surface-variant">
                    <ChevronRight className="mx-auto size-[18px]" aria-hidden="true" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked order cards */}
      <ul className="divide-y divide-surface-container-high/60 md:hidden">
        {orders.map((order) => {
          const selected = order.id === selectedId
          return (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => onSelect(order.id)}
                className={cn(
                  'flex w-full flex-col gap-2 p-space-md text-left transition-colors',
                  selected ? 'bg-surface-container-low shadow-[inset_4px_0_0_0_#FF6B35]' : 'hover:bg-surface-container-low',
                )}
              >
                <div className="flex items-center justify-between gap-space-sm">
                  <span className={cn('text-label-lg', selected && 'text-primary')}>#{order.orderNumber}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between gap-space-sm">
                  <div className="min-w-0">
                    <div className="truncate text-label-lg text-on-surface">{order.customerName}</div>
                    <div className="truncate text-body-sm text-on-surface-variant">
                      {order.restaurantName} · {itemsLabel(order.itemCount)} · {formatDateTime(order.placedAt)}
                    </div>
                  </div>
                  <span className="tabular shrink-0 font-display text-headline-sm">{formatINR(order.total)}</span>
                </div>
                <Payment order={order} />
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-space-sm px-space-md py-space-sm">
        <div className="flex flex-wrap items-center gap-space-md text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            {isFetching && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            Showing <strong className="text-on-surface">{start}–{end}</strong> of <strong className="text-on-surface">{total}</strong> orders
          </span>
          <label className="flex items-center gap-space-xs">
            Rows per page:
            <NativeSelect
              className="w-16"
              selectClassName="h-7 text-label-sm"
              options={PAGE_SIZES}
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            />
          </label>
        </div>
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </div>
    </Card>
  )
}
