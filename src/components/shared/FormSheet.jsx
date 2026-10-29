import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { FormAlert } from './Form'

/**
 * Slide-over drawer with a form: scrollable body, sticky footer with
 * Delete (optional) / Discard / Submit. Children are the form fields.
 */
export function FormSheet({ open, onOpenChange, title, description, onSubmit, submitLabel, pending, error, onDelete, deleting, children }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="px-space-xl pt-space-xl pr-14 pb-space-lg">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="flex min-h-0 flex-1 flex-col justify-between"
        >
          <div className="space-y-space-md overflow-y-auto px-space-xl pb-space-lg">
            <FormAlert>{error?.message}</FormAlert>
            {children}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-space-md border-t border-surface-container px-space-xl py-space-lg">
            {onDelete && (
              <Button variant="ghost-danger" className="mr-auto" onClick={onDelete} disabled={deleting}>
                <Trash2 /> Delete
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="neutral">Discard</Button>
            </SheetClose>
            <Button type="submit" variant="primary" size="lg" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
