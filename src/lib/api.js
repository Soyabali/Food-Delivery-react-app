// Thin fetch wrapper for the Apna Food FastAPI backend.
// Errors come back as {"message": "..."}; we surface that text directly.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const TOKEN_KEY = 'apnafood.adminToken'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Storage unavailable (private mode): the session lasts for this tab only.
    }
  },
}

let onUnauthorized = () => {}
/** AuthProvider registers this so an expired session logs the admin out. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

function buildQuery(query) {
  if (!query) return ''
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  const text = params.toString()
  return text ? `?${text}` : ''
}

export async function api(path, { method = 'GET', body, query, form, auth = true } = {}) {
  const headers = {}
  const token = tokenStore.get()
  if (auth && token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${BASE_URL}/api${path}${buildQuery(query)}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } catch {
    throw new ApiError(0, 'Can’t reach the Apna Food API. Is the backend running on port 8000?')
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && auth && token) onUnauthorized()
    throw new ApiError(response.status, data?.message ?? `Request failed (${response.status}).`)
  }
  return data
}

/** Follows `page` until every row is loaded (capped to protect the browser). */
export async function fetchAllPages(path, query = {}, { pageSize = 100, maxPages = 10 } = {}) {
  const items = []
  for (let page = 1; page <= maxPages; page += 1) {
    const result = await api(path, { query: { ...query, page, pageSize } })
    items.push(...result.items)
    if (items.length >= result.total || result.items.length === 0) break
  }
  return items
}
