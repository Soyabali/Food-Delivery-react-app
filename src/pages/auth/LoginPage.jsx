import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import { AuthLayout, FormAlert, FormField, PasswordInput } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      await login(form)
      // <GuestOnly> redirects to the dashboard once the session is set.
    } catch (err) {
      setError(err.message)
      setPending(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to the Apna Food operations console."
      footer={
        <>
          New to the team?{' '}
          <Link to="/register" className="text-label-lg text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-space-lg" noValidate={false}>
        <FormAlert>{error}</FormAlert>
        <FormField label="Email" htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            className="h-11"
            placeholder="admin@apnafood.com"
            value={form.email}
            onChange={set('email')}
            required
            autoFocus
          />
        </FormField>
        <FormField
          label="Password"
          htmlFor="login-password"
          action={
            <Link to="/forgot-password" className="text-label-md text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            value={form.password}
            onChange={set('password')}
            required
          />
        </FormField>
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
