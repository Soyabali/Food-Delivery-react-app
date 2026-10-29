import { ArrowRight, Bike, Check, ChefHat, CircleX, Clock, ExternalLink, House, Loader2, MapPin, MessageSquare, Phone, Store, User, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/select'
import { FormAlert } from '@/components/shared/Form'
import { LoadingCard } from '@/components/shared/QueryState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useOrder, useUpdateOrderStatus, useUpdatePaymentStatus } from '@/hooks/queries'
import { formatDateTime, formatTime, timeAgo } from '@/lib/format'
import { getNextStatus, ORDER_FLOW, ORDER_STATUS, PAYMENT_METHOD_LABEL, PAYMENT_STATUS } from '@/lib/orderStatus'
import { cn, formatINR } from '@/lib/utils'

const steps = [
  { status: 'placed', label: 'Placed', icon: Check },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'out_for_delivery', label: 'Out for delivery', icon: Bike },
  { status: 'delivered', label: 'Delivered', icon: House },
]

function OrderTimeline({ order }) {
  const cancelled = order.status === 'cancelled'
  const reached = (status) => order.statusHistory.find((e) => e.status === status)
  // For cancelled orders, show progress up to the last real step.
  const lastReached = Math.max(...ORDER_FLOW.map((s, i) => (reached(s) ? i : 0)))
  const currentIndex = cancelled ? lastReached : ORDER_FLOW.indexOf(order.status)

  return (
    <section className="rounded-xl bg-surface-container-low p-space-md">
      <h3 className="mb-space-md font-sans text-label-sm tracking-wider text-on-surface-variant uppercase">Live Order Timeline</h3>
      <ol className="relative grid grid-cols-4">
        <span className="absolute top-3.5 right-[12.5%] left-[12.5%] h-0.5 bg-surface-container-high" aria-hidden="true" />
        <span
          className="absolute top-3.5 left-[12.5%] h-0.5 bg-success-bright transition-all"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 75}%` }}
          aria-hidden="true"
        />
        {steps.map((step, index) => {
          const done = index < currentIndex || (index === currentIndex && (order.status === 'delivered' || cancelled))
          const current = index === currentIndex && !done
          const event = reached(step.status)
          const Icon = done ? Check : step.icon
          const time = event
            ? formatTime(event.changedAt)
            : step.status === 'delivered' && !cancelled
              ? `Est ${formatTime(order.eta)}`
              : '—'
          return (
            <li key={step.status} className="relative z-10 flex flex-col items-center text-center">
              <span className="relative flex items-center justify-center">
                {current && <span className="absolute size-7 animate-ping rounded-full bg-primary-container/30" />}
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full shadow-sm',
                    done && 'bg-success-bright text-on-primary',
                    current && 'bg-primary-container text-on-primary',
                    !done && !current && 'bg-surface-container text-on-surface-variant shadow-none',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </span>
              <span className={cn('mt-1.5 text-label-md', current ? 'text-primary' : done ? 'text-on-surface' : 'text-on-surface-variant')}>
                {step.label}
              </span>
              <span className={cn('text-body-sm', event ? 'text-on-surface-variant' : 'text-on-surface-variant/60')}>{time}</span>
            </li>
          )
        })}
      </ol>
      {cancelled && (
        <p className="mt-space-md rounded-lg bg-tertiary-fixed px-space-md py-space-sm text-body-sm text-tertiary">
          This order was cancelled{reached('cancelled') ? ` at ${formatTime(reached('cancelled').changedAt)}` : ''}.
        </p>
      )}
    </section>
  )
}

function BillRow({ label, children, className }) {
  return (
    <div className={cn('flex items-center justify-between gap-space-md text-on-surface-variant', className)}>
      <span>{label}</span>
      {children}
    </div>
  )
}

export function OrderDetailPanel({ orderId, onClose, className }) {
  const { data: order, isPending, isError, error } = useOrder(orderId)
  const updateStatus = useUpdateOrderStatus()
  const updatePayment = useUpdatePaymentStatus()

  if (isPending) return <LoadingCard label="Loading order…" className={className} />
  if (isError) return <FormAlert>{error.message}</FormAlert>

  const next = getNextStatus(order.status)
  const canCancel = ['placed', 'preparing'].includes(order.status)
  const busy = updateStatus.isPending || updatePayment.isPending
  const mutationError = updateStatus.error ?? updatePayment.error

  function cancelOrder() {
    const reason = window.prompt(`Cancel order #${order.orderNumber}? Optionally enter a reason for the customer:`, '')
    if (reason === null) return
    updateStatus.mutate({ id: order.id, status: 'cancelled', note: reason.trim() || 'Cancelled by admin' })
  }

  return (
    <aside
      aria-label={`Order ${order.orderNumber} details`}
      className={cn('flex flex-col space-y-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-xl', className)}
    >
      <div className="flex items-start justify-between gap-space-md pb-space-sm">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h2 className="tabular text-headline-lg text-on-surface">#{order.orderNumber}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-body-sm text-on-surface-variant">
            <Clock className="size-3.5" aria-hidden="true" />
            Placed {timeAgo(order.placedAt)} ({formatDateTime(order.placedAt)})
          </p>
        </div>
        <Button variant="icon" size="icon" onClick={onClose}>
          <X className="size-5" />
          <span className="sr-only">Close details</span>
        </Button>
      </div>

      <OrderTimeline order={order} />

      <FormAlert>{mutationError?.message}</FormAlert>

      {(next || canCancel) && (
        <div className="flex flex-wrap items-center gap-space-sm">
          {next && (
            <Button
              variant="solid"
              size="lg"
              className="h-10 flex-1"
              disabled={busy}
              onClick={() => updateStatus.mutate({ id: order.id, status: next })}
            >
              {updateStatus.isPending ? <Loader2 className="animate-spin" /> : null}
              Mark as {ORDER_STATUS[next].label}
              <ArrowRight />
            </Button>
          )}
          {canCancel && (
            <Button variant="ghost-danger" size="lg" className="h-10" disabled={busy} onClick={cancelOrder}>
              <CircleX /> Cancel Order
            </Button>
          )}
        </div>
      )}

      <section className="space-y-space-md rounded-xl bg-surface-container-low p-space-md">
        <div className="flex flex-wrap items-start justify-between gap-space-sm">
          <div className="flex items-start gap-space-sm">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <User className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h4 className="font-sans text-label-lg text-on-surface">{order.customerName}</h4>
              <p className="text-body-sm text-on-surface-variant">{order.customerPhone ?? 'No phone on file'}</p>
            </div>
          </div>
          {order.customerPhone && (
            <Button asChild variant="outline" size="sm" className="h-7 px-space-sm text-label-sm">
              <a href={`tel:${order.customerPhone.replaceAll(' ', '')}`}>
                <Phone className="size-3.5" /> Call Customer
              </a>
            </Button>
          )}
        </div>
        <div className="flex items-start gap-space-sm rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
          <MapPin className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-label-md text-on-surface">{order.addressLabel}</p>
            <p className="text-body-sm text-on-surface-variant">{order.addressLine}</p>
            {order.instructions && (
              <p className="mt-1 inline-flex items-start gap-1 rounded bg-warning-container/60 px-2 py-0.5 text-body-sm text-warning">
                <MessageSquare className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {order.instructions}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-primary">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <h4 className="font-sans text-label-lg text-on-surface">{order.restaurantName}</h4>
        </div>
        <Link to="/restaurants" className="flex items-center gap-0.5 text-label-sm text-primary hover:underline">
          Outlet Info <ExternalLink className="size-3.5" aria-hidden="true" />
        </Link>
      </section>

      <section className="space-y-space-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-label-lg text-on-surface">Items Ordered</h3>
          <span className="text-label-sm text-on-surface-variant">
            {order.items.length} distinct · {order.itemCount} total units
          </span>
        </div>
        <ul className="space-y-space-xs">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-space-md rounded-lg bg-surface-container-low p-space-sm">
              <div className="min-w-0">
                <p className="text-label-lg text-on-surface">{item.name}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {[item.variantName, item.spiceLevel && `Spice: ${item.spiceLevel}`].filter(Boolean).join(' · ') || 'Standard'}
                </p>
                {item.addOnNames.length > 0 && <p className="mt-1 text-body-sm text-on-surface-variant">+ {item.addOnNames.join(', ')}</p>}
                {item.note && <p className="mt-1 text-body-sm text-warning">“{item.note}”</p>}
              </div>
              <div className="shrink-0 text-right">
                <span className="tabular text-body-sm text-on-surface-variant">
                  {item.quantity} × {formatINR(item.unitPrice, { decimals: false })}
                </span>
                <p className="tabular text-label-lg text-on-surface">{formatINR(item.lineTotal)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="tabular space-y-space-xs rounded-xl bg-surface-container-low p-space-md text-body-sm">
        <h4 className="mb-1 font-sans text-label-sm tracking-wider text-on-surface-variant uppercase">Payment Summary</h4>
        <BillRow label="Item Total">
          <span className="text-on-surface">{formatINR(order.itemTotal)}</span>
        </BillRow>
        <BillRow label="Delivery Fee">
          {order.deliveryFee ? (
            <span className="text-on-surface">{formatINR(order.deliveryFee)}</span>
          ) : (
            <span className="font-semibold text-success">FREE</span>
          )}
        </BillRow>
        <BillRow label="Taxes & Charges">
          <span className="text-on-surface">{formatINR(order.taxes)}</span>
        </BillRow>
        {order.discount > 0 && (
          <BillRow label={order.couponCode ? `Coupon applied: ${order.couponCode}` : 'Discount'} className="text-success">
            <span className="font-semibold">−{formatINR(order.discount)}</span>
          </BillRow>
        )}
        <div className="my-2 h-px bg-surface-variant" />
        <div className="flex flex-wrap items-end justify-between gap-space-md pt-1">
          <div>
            <p className="font-display text-headline-sm text-on-surface">Total Payable</p>
            <label className="mt-1 flex items-center gap-space-xs text-on-surface-variant">
              {PAYMENT_METHOD_LABEL[order.paymentMethod]} ·
              <NativeSelect
                className="w-32"
                selectClassName="h-7 text-label-sm"
                options={Object.entries(PAYMENT_STATUS).map(([value, { label }]) => ({ value, label }))}
                value={order.paymentStatus}
                disabled={busy}
                onChange={(e) => updatePayment.mutate({ id: order.id, paymentStatus: e.target.value })}
                aria-label="Payment status"
              />
            </label>
          </div>
          <span className="font-display text-headline-md text-on-surface">{formatINR(order.total)}</span>
        </div>
      </section>

      <section className="space-y-space-xs pt-space-xs">
        <h4 className="font-sans text-label-sm tracking-wider text-on-surface-variant uppercase">Activity History</h4>
        <ul className="space-y-2 text-body-sm text-on-surface-variant">
          {[...order.statusHistory].reverse().map((event, index) => (
            <li key={`${event.changedAt}-${index}`} className="flex items-start gap-2">
              <span className="tabular mt-0.5 shrink-0 text-label-sm text-on-surface">{formatTime(event.changedAt)}</span>
              <span>
                Status changed to <strong className="text-primary">{ORDER_STATUS[event.status]?.label ?? event.status}</strong>
                {event.note && ` — ${event.note}`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
