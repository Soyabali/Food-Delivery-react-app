import { ArrowLeft, Loader2, ShieldCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import { AuthLayout, FormAlert, FormField, PasswordInput } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Same rules the API enforces, checked early for friendlier messages.
function validate(form) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Enter your full name.'
  if (form.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a 10-digit mobile number.'
  if (form.password.length < 8) errors.password = 'Use at least 8 characters.'
  if (form.confirm !== form.password) errors.confirm = 'Passwords don’t match.'
  return errors
}

export function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [pending, setPending] = useState(false)
  const [awaitingAccess, setAwaitingAccess] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length) return
    setPending(true)
    try {
      const isAdmin = await register(form)
      if (!isAdmin) setAwaitingAccess(true)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setPending(false)
    }
  }

  if (awaitingAccess) {
    return (
      <AuthLayout title="Account created" description={`Welcome aboard, ${form.name.split(' ')[0]}!`}>
        <div className="space-y-space-lg rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex items-start gap-space-md">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-fixed text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <p className="text-body-md text-on-surface-variant">
              Your account <strong className="text-on-surface">{form.email}</strong> is ready, but new accounts start
              as customers. Ask an existing admin to open <strong className="text-on-surface">Customers</strong> in
              the dashboard and change your role to <strong className="text-on-surface">Admin</strong>, then sign in.
            </p>
          </div>
          <Button asChild variant="solid" size="lg" className="w-full">
            <Link to="/login">
              <ArrowLeft /> Back to sign in
            </Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Join the Apna Food operations team."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-label-lg text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-space-lg">
        <FormAlert>{serverError}</FormAlert>
        <FormField label="Full name" htmlFor="reg-name" error={errors.name}>
          <Input id="reg-name" autoComplete="name" className="h-11" value={form.name} onChange={set('name')} invalid={!!errors.name} required autoFocus />
        </FormField>
        <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2">
          <FormField label="Email" htmlFor="reg-email">
            <Input id="reg-email" type="email" autoComplete="email" className="h-11" value={form.email} onChange={set('email')} required />
          </FormField>
          <FormField label="Mobile number" htmlFor="reg-phone" error={errors.phone}>
            <Input
              id="reg-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="h-11"
              placeholder="98450 12345"
              value={form.phone}
              onChange={set('phone')}
              invalid={!!errors.phone}
              required
            />
          </FormField>
        </div>
        <FormField label="Password" htmlFor="reg-password" hint="At least 8 characters." error={errors.password}>
          <PasswordInput id="reg-password" autoComplete="new-password" value={form.password} onChange={set('password')} invalid={!!errors.password} required />
        </FormField>
        <FormField label="Confirm password" htmlFor="reg-confirm" error={errors.confirm}>
          <PasswordInput id="reg-confirm" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} invalid={!!errors.confirm} required />
        </FormField>
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
