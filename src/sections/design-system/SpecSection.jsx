import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Numbered section wrapper used throughout the component sheet. */
export function SpecSection({ number, title, meta, accent = 'bg-primary-container', className, children }) {
  return (
    <Card as="section" className={cn('p-space-lg sm:p-space-xl', className)}>
      <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className={cn('h-6 w-2.5 shrink-0 rounded-full', accent)} />
          <h2 className="text-headline-md text-on-surface">
            {number}. {title}
          </h2>
        </div>
        {meta && <span className="text-label-md text-on-surface-variant">{meta}</span>}
      </div>
      {children}
    </Card>
  )
}
