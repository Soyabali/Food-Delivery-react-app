import { CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function FormField({ label, htmlFor, hint, error, children, action, className }) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between gap-space-sm">
        <label htmlFor={htmlFor} className="text-label-lg text-on-surface">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p className="text-body-sm text-error">{error}</p>
      ) : (
        hint && <p className="text-body-sm text-on-surface-variant">{hint}</p>
      )}
    </div>
  )
}

export function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('h-11 pr-11', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-space-sm -translate-y-1/2 rounded p-1 text-on-surface-variant hover:text-on-surface"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  )
}

/** Error or success banner for forms. Renders nothing when empty. */
export function FormAlert({ tone = 'error', children }) {
  if (!children) return null
  const Icon = tone === 'error' ? CircleAlert : CircleCheck
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-space-sm rounded-lg px-space-md py-space-sm text-body-md',
        tone === 'error' ? 'bg-error-container/60 text-on-error-container' : 'bg-success-container text-success',
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

/** Checkbox row for boolean flags inside forms. */
export function CheckboxRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-space-md text-body-md text-on-surface">
      <span>
        {label}
        {description && <span className="block text-body-sm text-on-surface-variant">{description}</span>}
      </span>
      <input type="checkbox" className="size-4 shrink-0 accent-primary" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

/** Number input that keeps '' while typing and hands back a number or null. */
export function NumberInput({ value, onChange, ...props }) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      className="tabular h-10 bg-surface"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      {...props}
    />
  )
}
