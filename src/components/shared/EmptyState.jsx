import { cn } from '@/lib/utils'

/** <EmptyFeedState /> from the component sheet. */
export function EmptyState({ icon: Icon, title, children, action, className }) {
  return (
    <div className={cn('mx-auto flex max-w-sm flex-col items-center py-space-xl text-center', className)}>
      <div className="mb-space-lg flex size-20 items-center justify-center rounded-full bg-surface-container-low text-primary shadow-inner">
        <Icon className="size-10" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-headline-sm text-on-surface">{title}</h3>
      <p className="text-body-md text-on-surface-variant">{children}</p>
      {action && <div className="mt-space-lg">{action}</div>}
    </div>
  )
}
