import { cn } from '@/lib/utils'

export function Card({ className, as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={cn('rounded-xl bg-surface-container-lowest shadow-sm', className)}
      {...props}
    />
  )
}

/** Card title row: heading (+ optional inline adornment) left, meta/action right. */
export function CardHeader({ title, action, className, titleClassName, children }) {
  return (
    <div
      className={cn('mb-space-lg flex flex-wrap items-center justify-between gap-space-sm', className)}
    >
      <div className="flex min-w-0 items-center gap-space-sm">
        <h2 className={cn('text-headline-md text-on-surface', titleClassName)}>{title}</h2>
        {children}
      </div>
      {action}
    </div>
  )
}
