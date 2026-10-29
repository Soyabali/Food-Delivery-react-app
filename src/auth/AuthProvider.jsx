import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError, setUnauthorizedHandler, tokenStore } from '@/lib/api'
import { AuthContext } from './authContext'

const NOT_ADMIN = 'This account doesn’t have dashboard access. Ask an admin to grant you the Admin role.'

/**
 * The login response has no role, so admin access is confirmed by calling an
 * admin-only endpoint: 403 means "signed in, but a customer".
 */
async function loadAdmin() {
  const user = await api('/auth/me')
  try {
    await api('/admin/stats')
  } catch (error) {
    if (error.status === 403) throw new ApiError(403, NOT_ADMIN)
    throw error
  }
  return user
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState(() => ({
    status: tokenStore.get() ? 'checking' : 'signed-out',
    user: null,
  }))

  const endSession = useCallback(() => {
    tokenStore.set(null)
    queryClient.clear()
    setState({ status: 'signed-out', user: null })
  }, [queryClient])

  // Restore a saved session once on page load.
  useEffect(() => {
    if (!tokenStore.get()) return
    loadAdmin()
      .then((user) => setState({ status: 'signed-in', user }))
      .catch(() => {
        tokenStore.set(null)
        setState({ status: 'signed-out', user: null })
      })
  }, [])

  // Any 401 (expired or revoked session, e.g. after a password reset) logs out.
  useEffect(() => {
    setUnauthorizedHandler(endSession)
    return () => setUnauthorizedHandler(() => {})
  }, [endSession])

  const value = useMemo(() => {
    async function startSession(session) {
      tokenStore.set(session.token)
      try {
        const user = await loadAdmin()
        setState({ status: 'signed-in', user })
        return user
      } catch (error) {
        // Don't leave a customer session lying around in this browser.
        await api('/auth/logout', { method: 'POST' }).catch(() => {})
        tokenStore.set(null)
        throw error
      }
    }

    return {
      ...state,
      login: async ({ email, password }) =>
        startSession(await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })),

      /** Creates a customer account. Returns false when it still needs the Admin role. */
      register: async ({ name, email, phone, password }) => {
        const session = await api('/auth/register', { method: 'POST', body: { name, email, phone, password }, auth: false })
        try {
          await startSession(session)
          return true
        } catch (error) {
          if (error.status === 403) return false
          throw error
        }
      },

      logout: async () => {
        await api('/auth/logout', { method: 'POST' }).catch(() => {})
        endSession()
      },

      requestPasswordReset: (email) => api('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),

      resetPassword: ({ email, code, newPassword }) =>
        api('/auth/reset-password', { method: 'POST', body: { email, code, newPassword }, auth: false }),

      changePassword: ({ currentPassword, newPassword }) =>
        api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
    }
  }, [state, endSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
