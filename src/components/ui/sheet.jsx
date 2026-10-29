import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// shadcn/ui Sheet (slide-over drawer) on Radix Dialog: focus trapping,
// Esc-to-close and scroll locking are handled for us.
export const Sheet = DialogPrimitive.Root
export const SheetClose = DialogPrimitive.Close

export function SheetContent({ side = 'right', className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="sheet-overlay fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col bg-surface-container-lowest shadow-overlay outline-none',
          side === 'right' ? 'sheet-right right-0 w-full max-w-lg' : 'sheet-left left-0 w-sidebar max-w-[85vw]',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-space-lg right-space-lg rounded-lg p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function SheetTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title className={cn('text-headline-lg text-on-surface', className)} {...props} />
  )
}

export function SheetDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn('text-body-sm text-on-surface-variant', className)}
      {...props}
    />
  )
}
