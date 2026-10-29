import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { cn, formatINR, formatINRCompact } from '@/lib/utils'

const W = 700
const H = 240
const TOP = 36
const BASELINE = 205

/** Catmull-Rom spline → cubic Bézier path through every point. */
function smoothPath(points) {
  return points.reduce((d, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const p0 = arr[i - 2] ?? arr[i - 1]
    const p1 = arr[i - 1]
    const p3 = arr[i + 1] ?? p
    const c1 = { x: p1.x + (p.x - p0.x) / 6, y: p1.y + (p.y - p0.y) / 6 }
    const c2 = { x: p.x - (p3.x - p1.x) / 6, y: p.y - (p3.y - p1.y) / 6 }
    return `${d} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p.x} ${p.y}`
  }, '')
}

/**
 * Revenue line over order-volume bars.
 * series: { [range]: { label, title, total, points: [{ label, revenue, orders, current }] } }
 */
export function RevenueChart({ series, className }) {
  const ranges = Object.keys(series)
  const [range, setRange] = useState(ranges[0])
  const [hovered, setHovered] = useState(null)
  const { title, total, points } = series[range]
  const currentIndex = Math.max(0, points.findIndex((p) => p.current))
  const active = hovered ?? currentIndex
  const isEmpty = points.every((p) => p.orders === 0)

  const maxRevenue = Math.max(...points.map((p) => p.revenue))
  const minRevenue = Math.min(...points.map((p) => p.revenue))
  const maxOrders = Math.max(1, ...points.map((p) => p.orders))
  const step = W / points.length
  const barWidth = Math.min(28, step * 0.55)
  // Dense ranges (30 days) only label every few points.
  const labelEvery = Math.ceil(points.length / 8)

  const coords = points.map((p, i) => ({
    x: step * i + step / 2,
    y: BASELINE - 30 - ((p.revenue - minRevenue) / (maxRevenue - minRevenue || 1)) * (BASELINE - TOP - 50),
    barH: (p.orders / maxOrders) * (BASELINE - TOP - 10),
  }))
  const line = smoothPath(coords)
  const area = `${line} L ${coords.at(-1).x} ${BASELINE} L ${coords[0].x} ${BASELINE} Z`
  const activePoint = points[active]

  return (
    <Card className={cn('flex flex-col p-space-lg', className)}>
      <div className="mb-space-xl flex flex-col justify-between gap-space-md sm:flex-row sm:items-center">
        <div>
          <h2 className="text-headline-md text-on-surface">{title}</h2>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
            <span className="tabular font-display text-headline-lg text-on-surface">{formatINR(total, { decimals: false })}</span>
            <span className="text-body-sm text-on-surface-variant">Gross revenue (excl. cancelled)</span>
          </div>
        </div>
        <SegmentedControl
          label="Chart range"
          options={ranges.map((value) => ({ value, label: series[value].label }))}
          value={range}
          onChange={(value) => {
            setRange(value)
            setHovered(null)
          }}
          className="self-start sm:self-auto"
        />
      </div>

      <div className="relative h-56 w-full select-none sm:h-64" onMouseLeave={() => setHovered(null)}>
        <svg className="size-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#FF6B35" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#E6EEFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#E6EEFF" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {[40, 95, 150].map((y) => (
            <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="#EFF3FF" strokeDasharray="4 4" strokeWidth="1.5" />
          ))}
          <line x1="0" x2={W} y1={BASELINE} y2={BASELINE} stroke="#E6EEFF" strokeWidth="1.5" />
          {coords.map((c, i) => (
            <rect
              key={points[i].label}
              x={c.x - barWidth / 2}
              y={BASELINE - c.barH}
              width={barWidth}
              height={c.barH}
              rx="4"
              fill={i === active ? '#FE703C' : 'url(#barGradient)'}
              fillOpacity={i === active ? 0.25 : 1}
            />
          ))}
          {!isEmpty && (
            <>
              <path d={area} fill="url(#areaGradient)" />
              <path d={line} fill="none" stroke="#FF6B35" strokeWidth="3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>

        {isEmpty ? (
          <p className="absolute inset-0 flex items-center justify-center text-body-md text-on-surface-variant">
            No orders in this period yet — revenue will plot here as orders arrive.
          </p>
        ) : (
          coords.map((c, i) => (
            <button
              key={points[i].label}
              type="button"
              className="absolute top-0 h-full -translate-x-1/2 focus-visible:outline-none"
              style={{ left: `${(c.x / W) * 100}%`, width: `${(step / W) * 100}%` }}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              aria-label={`${points[i].label}: ${formatINR(points[i].revenue, { decimals: false })}, ${points[i].orders} orders`}
            >
              <span
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-primary-container',
                  i === active ? 'size-3 border-0 bg-primary-container ring-[2.5px] ring-white' : 'size-2 border-2 bg-white',
                  points.length > 12 && i !== active && 'hidden',
                )}
                style={{ top: `${(c.y / H) * 100}%` }}
              />
            </button>
          ))
        )}

        {!isEmpty && activePoint && (
          <div
            className="pointer-events-none absolute top-0 flex -translate-x-1/2 flex-col items-center rounded-lg bg-inverse-surface px-3 py-1.5 whitespace-nowrap shadow-md"
            style={{ left: `clamp(80px, ${(coords[active].x / W) * 100}%, calc(100% - 80px))` }}
          >
            <span className="text-label-sm text-white/70 uppercase">{activePoint.current ? `Now (${activePoint.label})` : activePoint.label}</span>
            <span className="tabular text-label-lg text-white">
              {formatINR(activePoint.revenue, { decimals: false })} · {activePoint.orders} {activePoint.orders === 1 ? 'order' : 'orders'}
            </span>
          </div>
        )}
      </div>

      <div className="grid pt-2 text-center" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
        {points.map((p, i) => (
          <span
            key={p.label}
            className={cn('truncate text-label-sm text-on-surface-variant', p.current && 'text-primary', i % labelEvery !== 0 && !p.current && 'invisible')}
          >
            {p.label}
            {points.length <= 9 && p.revenue > 0 && <span className="hidden tabular xl:inline"> ({formatINRCompact(p.revenue)})</span>}
          </span>
        ))}
      </div>
    </Card>
  )
}
