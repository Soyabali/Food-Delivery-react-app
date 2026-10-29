import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export function Switch({ className, size = 'default', ...props }) {
  const large = size === 'lg'
  return (
    <SwitchPrimitive.Root
      className={cn(
        'inline-flex shrink-0 items-center rounded-full bg-surface-dim p-0.5 transition-colors data-[state=checked]:bg-success-bright disabled:cursor-not-allowed disabled:opacity-50',
        large ? 'h-6 w-12' : 'h-5 w-9',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block rounded-full bg-surface-container-lowest shadow-sm transition-transform',
          large ? 'size-5 data-[state=checked]:translate-x-6' : 'size-4 data-[state=checked]:translate-x-4',
        )}
      />
    </SwitchPrimitive.Root>
  )
}
