import { KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/auth/authContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserAvatar } from '@/components/layout/Sidebar'
import { FormAlert, FormField, PasswordInput } from '@/components/shared/Form'
import { DesignSystemPage } from './DesignSystemPage'

function ChangePasswordForm() {
  const { changePassword } = useAuth()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [status, setStatus] = useState({ pending: false, error: '', message: '' })
  const text = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.next.length < 8) return setStatus({ error: 'Use at least 8 characters for the new password.' })
    if (form.next !== form.confirm) return setStatus({ error: 'New passwords don’t match.' })
    setStatus({ pending: true })
    try {
      const { message } = await changePassword({ currentPassword: form.current, newPassword: form.next })
      setStatus({ message })
      setForm({ current: '', next: '', confirm: '' })
    } catch (error) {
      setStatus({ error: error.message })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-space-md">
      <FormAlert>{status.error}</FormAlert>
      <FormAlert tone="success">{status.message}</FormAlert>
      <FormField label="Current password" htmlFor="pw-current">
        <PasswordInput id="pw-current" autoComplete="current-password" value={form.current} onChange={text('current')} required />
      </FormField>
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <FormField label="New password" htmlFor="pw-new" hint="At least 8 characters.">
          <PasswordInput id="pw-new" autoComplete="new-password" value={form.next} onChange={text('next')} required />
        </FormField>
        <FormField label="Confirm new password" htmlFor="pw-confirm">
          <PasswordInput id="pw-confirm" autoComplete="new-password" value={form.confirm} onChange={text('confirm')} required />
        </FormField>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="solid" disabled={status.pending}>
          {status.pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
          Update password
        </Button>
      </div>
    </form>
  )
}

export function SettingsPage() {
  const { user } = useAuth()
  return (
    <div className="flex flex-col gap-space-xl">
      <div>
        <h1 className="text-headline-lg text-on-surface sm:text-headline-xl">Settings</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Your account, security, and the Apna Food design system.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-space-xl xl:grid-cols-3">
        <Card className="flex flex-col items-center gap-space-sm p-space-xl text-center">
          <UserAvatar name={user?.name} className="size-16 text-headline-md" />
          <h2 className="text-headline-md text-on-surface">{user?.name}</h2>
          <p className="text-body-md text-on-surface-variant">{user?.email}</p>
          {user?.phone && <p className="text-body-sm text-on-surface-variant">{user.phone}</p>}
          <span className="mt-space-xs flex items-center gap-1 rounded-full bg-secondary-fixed px-space-md py-1 text-label-md text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" /> Admin
          </span>
        </Card>
        <Card className="p-space-lg xl:col-span-2">
          <h2 className="mb-space-md text-headline-md text-on-surface">Change password</h2>
          <ChangePasswordForm />
        </Card>
      </div>

      <div className="border-t border-surface-variant pt-space-xl">
        <DesignSystemPage />
      </div>
    </div>
  )
}
