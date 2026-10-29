import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// A styled native <select>. It stays fully accessible and uses the OS picker
// on phones, which suits these short option lists better than a popover.
export function NativeSelect({ className, selectClassName, options, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select
        className={cn(
          'h-9 w-full appearance-none rounded-lg bg-surface-container-low pr-8 pl-space-md text-label-lg text-on-surface focus:shadow-[0_0_0_3px_rgba(255,107,53,0.2)] focus:outline-none',
          selectClassName,
        )}
        {...props}
      >
        {options.map((option) => {
          const { value, label } =
            typeof option === 'string' ? { value: option, label: option } : option
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-space-sm size-4 -translate-y-1/2 text-on-surface-variant"
        aria-hidden="true"
      />
    </div>
  )
}
