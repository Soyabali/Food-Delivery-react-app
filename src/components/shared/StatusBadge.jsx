import { Check, X } from 'lucide-react'
import { ORDER_STATUS } from '@/lib/orderStatus'
import { cn } from '@/lib/utils'

/** Order lifecycle pill with a pulse dot on the live stages. */
export function StatusBadge({ status, label, className }) {
  const meta = ORDER_STATUS[status]
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-label-md whitespace-nowrap',
        meta.badge,
        className,
      )}
    >
      {status === 'delivered' && <Check className="size-3.5" aria-hidden="true" />}
      {status === 'cancelled' && <X className="size-3.5" aria-hidden="true" />}
      {(meta.live || status === 'placed') && (
        <span className={cn('size-1.5 rounded-full', meta.dot, meta.live && 'animate-pulse')} />
      )}
      {label ?? meta.label}
    </span>
  )
}

/** Small rectangular tag, e.g. payment method or "Paid". */
export function Tag({ tone = 'neutral', className, children }) {
  const tones = {
    neutral: 'bg-surface-container text-on-surface',
    success: 'bg-success-container text-success',
    warning: 'bg-warning-container text-warning',
    danger: 'bg-tertiary-fixed text-tertiary',
    brand: 'bg-secondary-fixed text-primary',
  }
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-label-sm whitespace-nowrap', tones[tone], className)}>
      {children}
    </span>
  )
}
