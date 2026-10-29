import { CircleCheck, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const tones = {
  success: { border: 'border-emerald-500', icon: CircleCheck, iconClass: 'text-emerald-400' },
  warning: { border: 'border-primary-container', icon: TriangleAlert, iconClass: 'text-primary-container' },
}

/** Dark operator-HUD toast. Purely presentational; the caller owns its lifetime. */
export function Toast({ tone = 'success', title, description, action, onDismiss, className }) {
  const { border, icon: Icon, iconClass } = tones[tone]
  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-between gap-space-md rounded-xl border-l-4 bg-on-surface p-space-md text-on-primary shadow-2xl',
        border,
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-space-md">
        <Icon className={cn('size-5 shrink-0', iconClass)} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-label-lg">{title}</p>
          {description && <p className="text-body-sm text-surface-variant/80">{description}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {action}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded p-1 text-surface-variant/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
