import { cn } from '@/lib/utils'

/**
 * Pill-style tab group ("Live Feed / Rider Map / SLA Queue").
 * options: [{ value, label, icon? }]
 */
export function SegmentedControl({ options, value, onChange, label, className, itemClassName }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex items-center gap-1 rounded-lg bg-surface-container p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-label-sm whitespace-nowrap transition-colors',
              active
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
              itemClassName,
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
