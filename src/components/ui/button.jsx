import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// shadcn/ui Button, restyled to the Apna Food button matrix
// (primary gradient, solid, tinted, destructive, ghost…).
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-space-xs whitespace-nowrap rounded-lg text-label-lg transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand-gradient text-on-primary shadow-md hover:brightness-105',
        solid: 'bg-primary-container text-on-primary shadow-sm hover:bg-secondary-container',
        deep: 'bg-primary text-on-primary shadow-sm hover:brightness-110',
        tinted: 'bg-surface-container-low text-primary hover:bg-surface-container',
        neutral: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
        outline: 'bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container-low',
        destructive: 'bg-tertiary-fixed text-tertiary hover:bg-error-container hover:text-on-error-container',
        ghost: 'text-primary hover:bg-surface-container-low',
        'ghost-danger': 'text-tertiary hover:bg-error-container/40',
        icon: 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
      },
      size: {
        sm: 'h-8 px-space-md text-label-md [&_svg]:size-4',
        default: 'h-9 px-space-lg',
        lg: 'h-[42px] px-space-lg',
        icon: 'size-9',
        'icon-sm': 'size-8 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'tinted', size: 'default' },
  },
)

export function Button({ className, variant, size, asChild = false, type = 'button', ...props }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
