import { formatDay } from './format'

// Turns raw orders into chart series. Cancelled orders don't count as revenue.

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** ISO timestamp for local midnight `daysAgo` days back (stable within a day). */
export function sinceDaysAgo(daysAgo) {
  const d = startOfDay(new Date())
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

const counts = (order) => order.status !== 'cancelled'

/** One point per day for the last `days` days, oldest first; today is `current`. */
export function dailySeries(orders, days) {
  const today = startOfDay(new Date())
  const points = Array.from({ length: days }, (_, i) => {
    const day = new Date(today)
    day.setDate(day.getDate() - (days - 1 - i))
    return { key: day.toDateString(), label: formatDay(day), revenue: 0, orders: 0, current: i === days - 1 }
  })
  const byKey = new Map(points.map((p) => [p.key, p]))
  orders.forEach((order) => {
    const point = byKey.get(new Date(order.placedAt).toDateString())
    if (!point || !counts(order)) return
    point.revenue += order.total
    point.orders += 1
  })
  return points
}

/** Two-hour buckets for today, 6 AM → midnight. */
export function hourlySeries(orders) {
  const nowHour = new Date().getHours()
  const points = Array.from({ length: 9 }, (_, i) => {
    const hour = 6 + i * 2
    const label = new Date(2000, 0, 1, hour).toLocaleTimeString('en-IN', { hour: 'numeric' }).toUpperCase()
    return { hour, label, revenue: 0, orders: 0, current: nowHour >= hour && nowHour < hour + 2 }
  })
  const today = new Date().toDateString()
  orders.forEach((order) => {
    const placed = new Date(order.placedAt)
    if (placed.toDateString() !== today || !counts(order)) return
    const point = points.find((p) => placed.getHours() >= p.hour && placed.getHours() < p.hour + 2)
    if (!point) return
    point.revenue += order.total
    point.orders += 1
  })
  return points
}

export const sumRevenue = (points) => points.reduce((sum, p) => sum + p.revenue, 0)

/** Percentage change, or null when there's no baseline to compare with. */
export function percentChange(current, previous) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}
