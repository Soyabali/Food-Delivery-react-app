// Date helpers. The API returns ISO timestamps in UTC; we show local time.

const timeFormatter = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const dayFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })

export const formatTime = (iso) => (iso ? timeFormatter.format(new Date(iso)).toUpperCase() : '—')
export const formatDate = (iso) => (iso ? dateFormatter.format(new Date(iso)) : '—')
export const formatDay = (date) => dayFormatter.format(date)

export function isToday(iso) {
  return new Date(iso).toDateString() === new Date().toDateString()
}

/** "Today, 5:09 PM" or "28 Oct, 5:09 PM" */
export function formatDateTime(iso) {
  if (!iso) return '—'
  return `${isToday(iso) ? 'Today' : formatDay(new Date(iso))}, ${formatTime(iso)}`
}

/** "just now", "12m ago", "3h ago", "2d ago" */
export function timeAgo(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function minutesSince(iso) {
  return Math.round((Date.now() - new Date(iso).getTime()) / 60000)
}

/** 2048 -> "2 KB", 1572864 -> "1.5 MB" */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`
}

/** "Royal Biryani House" -> "royal-biryani-house" (matches the API's slug rule). */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
