import { Loader2 } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authContext'

/** Gate for every dashboard route. */
export function RequireAdmin() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-space-sm text-body-md text-on-surface-variant">
        <Loader2 className="size-5 animate-spin text-primary-container" aria-hidden="true" />
        Restoring your session…
      </div>
    )
  }
  if (status !== 'signed-in') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

/** Login/registration pages redirect away once signed in. */
export function GuestOnly() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'signed-in') {
    return <Navigate to={location.state?.from?.pathname ?? '/'} replace />
  }
  return <Outlet />
}
