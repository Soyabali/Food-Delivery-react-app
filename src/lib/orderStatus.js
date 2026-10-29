// Order lifecycle (matches the PostgreSQL `order_status` enum) and the
// paired colour tokens from the design spec.
export const ORDER_STATUS = {
  placed: {
    label: 'Placed',
    badge: 'bg-surface-container text-on-surface',
    dot: 'bg-on-surface/60',
    accent: null,
    chart: '#390C00',
  },
  preparing: {
    label: 'Preparing',
    badge: 'bg-primary-fixed text-primary',
    dot: 'bg-primary',
    accent: 'bg-primary-container',
    live: true,
    chart: '#FE703C',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    badge: 'bg-warning-container text-warning',
    dot: 'bg-warning',
    accent: 'bg-warning',
    live: true,
    chart: '#E6AA00',
  },
  delivered: {
    label: 'Delivered',
    badge: 'bg-success-container text-success',
    dot: 'bg-success',
    accent: null,
    chart: '#006D37',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-tertiary-fixed text-tertiary',
    dot: 'bg-tertiary',
    accent: null,
    chart: '#BD092E',
  },
}

export const ORDER_STATUSES = Object.keys(ORDER_STATUS)
export const ACTIVE_STATUSES = ['placed', 'preparing', 'out_for_delivery']

/** The forward path an order moves through. Cancelled is a side exit. */
export const ORDER_FLOW = ['placed', 'preparing', 'out_for_delivery', 'delivered']

export function getNextStatus(status) {
  const index = ORDER_FLOW.indexOf(status)
  return index === -1 || index === ORDER_FLOW.length - 1 ? null : ORDER_FLOW[index + 1]
}

// `payment_status` / `payment_method` enums.
export const PAYMENT_STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'danger' },
}

export const PAYMENT_METHOD_LABEL = { upi: 'UPI', card: 'Card', cod: 'COD' }
