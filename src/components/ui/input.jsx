import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', invalid = false, ...props }) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-9 w-full min-w-0 rounded-lg bg-surface-container-low px-space-md text-body-md text-on-surface transition-all placeholder:text-on-surface-variant/60',
        'focus:bg-surface-container-lowest focus:shadow-[0_0_0_3px_rgba(255,107,53,0.2)] focus:outline-none',
        'aria-invalid:bg-error-container/40 aria-invalid:text-error',
        className,
      )}
      {...props}
    />
  )
}

/** Input with a leading icon (search fields) and optional trailing slot (⌘K hint). */
export function IconInput({ icon: Icon, className, inputClassName, trailing, ...props }) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Icon
        className="pointer-events-none absolute left-space-md size-4 text-on-surface-variant"
        aria-hidden="true"
      />
      <Input className={cn('pl-9', trailing && 'pr-14', inputClassName)} {...props} />
      {trailing && <span className="absolute right-space-md">{trailing}</span>}
    </div>
  )
}

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('mb-1 block text-label-sm text-on-surface-variant uppercase', className)}
      {...props}
    />
  )
}
