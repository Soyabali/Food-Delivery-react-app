import { ArrowLeft, KeyRound, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import { AuthLayout, FormAlert, FormField, PasswordInput } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const backToLogin = (
  <Link to="/login" className="inline-flex items-center gap-1 text-label-lg text-primary hover:underline">
    <ArrowLeft className="size-4" aria-hidden="true" /> Back to sign in
  </Link>
)

/** Two steps: request a 6-digit code by email, then set a new password with it. */
export function ForgotPasswordPage() {
  const { requestPasswordReset, resetPassword } = useAuth()
  const [step, setStep] = useState('email') // email → code → done
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({ code: '', password: '', confirm: '' })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function run(action) {
    setError('')
    setPending(true)
    try {
      await action()
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  const sendCode = (event) => {
    event?.preventDefault()
    return run(async () => {
      await requestPasswordReset(email)
      setStep('code')
    })
  }

  const submitReset = (event) => {
    event.preventDefault()
    if (form.password.length < 8) return setError('Use at least 8 characters for the new password.')
    if (form.password !== form.confirm) return setError('Passwords don’t match.')
    return run(async () => {
      const { message } = await resetPassword({ email, code: form.code, newPassword: form.password })
      setNotice(message)
      setStep('done')
    })
  }

  if (step === 'done') {
    return (
      <AuthLayout title="Password updated" footer={backToLogin}>
        <FormAlert tone="success">{notice}</FormAlert>
        <Button asChild variant="primary" size="lg" className="mt-space-lg w-full">
          <Link to="/login">Sign in with your new password</Link>
        </Button>
      </AuthLayout>
    )
  }

  if (step === 'code') {
    return (
      <AuthLayout
        title="Enter your reset code"
        description={`If ${email} has an account, a 6-digit code is on its way. It expires in 15 minutes.`}
        footer={backToLogin}
      >
        <form onSubmit={submitReset} className="space-y-space-lg">
          <FormAlert>{error}</FormAlert>
          {import.meta.env.DEV && (
            <p className="rounded-lg bg-warning-container/60 px-space-md py-space-sm text-body-sm text-warning">
              Development: SMTP isn’t configured in the backend, so the code is printed in the FastAPI server log.
            </p>
          )}
          <FormField label="6-digit code" htmlFor="reset-code">
            <Input
              id="reset-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              className="tabular h-12 text-center font-display text-headline-md tracking-[0.5em]"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              required
              autoFocus
            />
          </FormField>
          <FormField label="New password" htmlFor="reset-password" hint="At least 8 characters.">
            <PasswordInput id="reset-password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </FormField>
          <FormField label="Confirm new password" htmlFor="reset-confirm">
            <PasswordInput id="reset-confirm" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </FormField>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending || form.code.length !== 6}>
            {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
            {pending ? 'Updating…' : 'Reset password'}
          </Button>
          <p className="text-center text-body-sm text-on-surface-variant">
            Didn’t get it?{' '}
            <button type="button" onClick={() => sendCode()} disabled={pending} className="text-label-md text-primary hover:underline">
              Send a new code
            </button>{' '}
            (you can resend after 45 seconds)
          </p>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot your password?" description="Enter your account email and we’ll send you a 6-digit reset code." footer={backToLogin}>
      <form onSubmit={sendCode} className="space-y-space-lg">
        <FormAlert>{error}</FormAlert>
        <FormField label="Email" htmlFor="forgot-email">
          <Input id="forgot-email" type="email" autoComplete="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </FormField>
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Mail />}
          {pending ? 'Sending…' : 'Send reset code'}
        </Button>
      </form>
    </AuthLayout>
  )
}
