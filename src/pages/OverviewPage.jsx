import { CirclePlus, RefreshCw, Store } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorCard, Skeleton } from '@/components/shared/QueryState'
import { useOrdersSince, useStats } from '@/hooks/queries'
import { dailySeries, hourlySeries, percentChange, sinceDaysAgo, sumRevenue } from '@/lib/analytics'
import { formatTime } from '@/lib/format'
import { LiveOrdersStream } from '@/sections/overview/LiveOrdersStream'
import { OverviewKpis } from '@/sections/overview/OverviewKpis'
import { QuickActions } from '@/sections/overview/QuickActions'
import { RevenueChart } from '@/sections/overview/RevenueChart'
import { StatusDonut } from '@/sections/overview/StatusDonut'
import { TopDishes } from '@/sections/overview/TopDishes'

function buildSeries(orders) {
  const week = dailySeries(orders, 7)
  const month = dailySeries(orders, 30)
  const hours = hourlySeries(orders)
  return {
    '7d': { label: 'Last 7 Days', title: 'Revenue & Velocity (Last 7 Days)', total: sumRevenue(week), points: week },
    '30d': { label: 'Last 30 Days', title: 'Revenue & Velocity (Last 30 Days)', total: sumRevenue(month), points: month },
    hourly: { label: 'Today, Hourly', title: 'Revenue & Velocity (Today)', total: sumRevenue(hours), points: hours },
  }
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-space-xl" aria-busy="true">
      <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-space-lg xl:grid-cols-12">
        <Skeleton className="h-96 rounded-xl xl:col-span-8" />
        <Skeleton className="h-96 rounded-xl xl:col-span-4" />
      </div>
    </div>
  )
}

export function OverviewPage() {
  // Fixed for the life of the page so the query key stays stable.
  const [since] = useState(() => sinceDaysAgo(29))
  const stats = useStats()
  const recent = useOrdersSince(since)

  const header = (
    <PageHeader
      eyebrow={
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-label-md text-success">
          <span className="size-1.5 animate-ping rounded-full bg-emerald-500" aria-hidden="true" />
          Live · updated {stats.dataUpdatedAt ? formatTime(new Date(stats.dataUpdatedAt).toISOString()) : '…'}
        </span>
      }
      title="Operations Hub"
      description="Real-time order throughput, revenue and catalogue health across every Apna Food kitchen."
      actions={
        <>
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl"
            onClick={() => Promise.all([stats.refetch(), recent.refetch()])}
            disabled={stats.isFetching}
          >
            <RefreshCw className={stats.isFetching ? 'animate-spin' : undefined} /> Refresh
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link to="/restaurants?register=1">
              <Store /> Add Restaurant
            </Link>
          </Button>
          <Button asChild variant="primary" size="lg" className="rounded-xl px-space-xl">
            <Link to="/menu-items?new=1">
              <CirclePlus /> Add Dish
            </Link>
          </Button>
        </>
      }
    />
  )

  if (stats.isPending || recent.isPending) {
    return (
      <div className="flex flex-col gap-space-xl">
        {header}
        <OverviewSkeleton />
      </div>
    )
  }
  const error = stats.error ?? recent.error
  if (error) {
    return (
      <div className="flex flex-col gap-space-xl">
        {header}
        <ErrorCard error={error} onRetry={() => Promise.all([stats.refetch(), recent.refetch()])} />
      </div>
    )
  }

  const series = buildSeries(recent.data)
  const [yesterday, today] = series['7d'].points.slice(-2)

  return (
    <div className="flex flex-col gap-space-xl">
      {header}

      <OverviewKpis
        stats={stats.data}
        today={today}
        yesterday={yesterday}
        revenueDelta={percentChange(stats.data.revenueToday, yesterday.revenue)}
        ordersDelta={percentChange(stats.data.ordersToday, yesterday.orders)}
      />

      <div className="grid grid-cols-1 gap-space-lg xl:grid-cols-12">
        <RevenueChart series={series} className="xl:col-span-8" />
        <StatusDonut ordersByStatus={stats.data.ordersByStatus} className="xl:col-span-4" />
      </div>

      <div className="grid grid-cols-1 gap-space-lg xl:grid-cols-12">
        <LiveOrdersStream className="xl:col-span-7" />
        <TopDishes items={stats.data.topItems} className="xl:col-span-5" />
      </div>

      <QuickActions />
    </div>
  )
}
