import { cn } from '@/lib/utils'

/** Page title block: optional eyebrow row, H1, description and actions. */
export function PageHeader({ eyebrow, title, badge, description, actions, className }) {
  return (
    <header
      className={cn('flex flex-col justify-between gap-space-lg lg:flex-row lg:items-end', className)}
    >
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 flex flex-wrap items-center gap-space-sm">{eyebrow}</div>}
        <div className="flex flex-wrap items-center gap-space-sm">
          <h1 className="text-headline-lg text-on-surface sm:text-headline-xl">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-space-sm sm:gap-space-md">{actions}</div>}
    </header>
  )
}

/** Animated "live" indicator dot (ping halo + solid core). */
export function LiveDot({ className, colorClass = 'bg-primary-container' }) {
  return (
    <span className={cn('relative inline-flex size-2.5', className)} aria-hidden="true">
      <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-75', colorClass)} />
      <span className={cn('relative inline-flex size-full rounded-full', colorClass)} />
    </span>
  )
}
