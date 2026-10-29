import { Download, Loader2 } from 'lucide-react'
import { useDeferredValue, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorCard, LoadingCard } from '@/components/shared/QueryState'
import { useOrders, useRestaurants, useStats } from '@/hooks/queries'
import { fetchAllPages } from '@/lib/api'
import { sinceDaysAgo } from '@/lib/analytics'
import { downloadCsv } from '@/lib/csv'
import { formatDateTime } from '@/lib/format'
import { ORDER_STATUS, PAYMENT_METHOD_LABEL, PAYMENT_STATUS } from '@/lib/orderStatus'
import { OrderDetailPanel } from '@/sections/orders/OrderDetailPanel'
import { OrdersAlertBanner } from '@/sections/orders/OrdersAlertBanner'
import { OrdersFilterBar } from '@/sections/orders/OrdersFilterBar'
import { OrdersTable } from '@/sections/orders/OrdersTable'

const rangeStart = { today: () => sinceDaysAgo(0), '7d': () => sinceDaysAgo(6), '30d': () => sinceDaysAgo(29) }

const csvColumns = [
  { header: 'Order', value: (o) => o.orderNumber },
  { header: 'Placed', value: (o) => formatDateTime(o.placedAt) },
  { header: 'Customer', value: (o) => o.customerName },
  { header: 'Phone', value: (o) => o.customerPhone },
  { header: 'Restaurant', value: (o) => o.restaurantName },
  { header: 'Items', value: (o) => o.itemCount },
  { header: 'Total (INR)', value: (o) => o.total.toFixed(2) },
  { header: 'Payment', value: (o) => `${PAYMENT_METHOD_LABEL[o.paymentMethod]} (${PAYMENT_STATUS[o.paymentStatus]?.label})` },
  { header: 'Status', value: (o) => ORDER_STATUS[o.status]?.label },
]

export function OrdersPage() {
  const [searchParams] = useSearchParams()
  const detailRef = useRef(null)
  // ?q= comes from the global search, ?order= from the Overview stream.
  const [filters, setFilters] = useState(() => ({ status: 'all', q: searchParams.get('q') ?? '', restaurantId: '', range: 'all' }))
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  // undefined = nothing chosen yet (show the first order), null = panel closed.
  const [selectedId, setSelectedId] = useState(() => Number(searchParams.get('order')) || undefined)
  const [exporting, setExporting] = useState(false)

  // Typing in search shouldn't fire a request per keystroke.
  const q = useDeferredValue(filters.q.trim())
  const query = {
    status: filters.status === 'all' ? undefined : filters.status,
    q: q || undefined,
    restaurantId: filters.restaurantId || undefined,
    from: rangeStart[filters.range]?.(),
  }

  const stats = useStats()
  const { list: restaurants } = useRestaurants()
  const orders = useOrders({ ...query, page, pageSize })
  const hasFilters = Object.values(query).some(Boolean)

  // The first order on screen is shown in detail until the admin picks one.
  const shownId = selectedId === undefined ? (orders.data?.items[0]?.id ?? null) : selectedId

  function handleFilters(next) {
    setFilters(next)
    setPage(1)
  }

  function handleSelect(id) {
    setSelectedId(id)
    // Below 2xl the panel sits under the table, so bring it into view.
    if (!window.matchMedia('(min-width: 1536px)').matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const rows = await fetchAllPages('/admin/orders', query)
      downloadCsv(`apnafood-orders-${new Date().toISOString().slice(0, 10)}.csv`, csvColumns, rows)
    } catch (error) {
      window.alert(`Export failed: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <OrdersAlertBanner stats={stats.data} />

      <PageHeader
        title="Orders Management"
        description="Monitor live order queues, kitchen progress, payments and receipts"
        actions={
          <Button variant="tinted" className="shadow-sm" onClick={handleExport} disabled={exporting || !orders.data?.total}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            Export CSV
          </Button>
        }
      />

      <OrdersFilterBar
        filters={filters}
        onChange={handleFilters}
        counts={stats.data?.ordersByStatus ?? {}}
        restaurants={restaurants.data ?? []}
      />

      {orders.isPending ? (
        <LoadingCard label="Loading orders…" />
      ) : orders.isError ? (
        <ErrorCard error={orders.error} onRetry={orders.refetch} />
      ) : (
        <div className="flex w-full flex-col items-start gap-space-lg 2xl:flex-row">
          <OrdersTable
            data={orders.data}
            isFetching={orders.isFetching}
            page={page}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            selectedId={shownId}
            onSelect={handleSelect}
            hasFilters={hasFilters}
          />
          {shownId && (
            <div ref={detailRef} className="w-full scroll-mt-20 2xl:w-[520px] 2xl:shrink-0">
              <OrderDetailPanel key={shownId} orderId={shownId} onClose={() => setSelectedId(null)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
