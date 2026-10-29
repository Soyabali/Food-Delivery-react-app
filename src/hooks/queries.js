import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, fetchAllPages } from '@/lib/api'

// Dashboard data refreshes itself while the tab is open.
const LIVE = { refetchInterval: 30_000 }

export const keys = {
  stats: ['stats'],
  orders: (params) => ['orders', params],
  ordersSince: (from) => ['orders', 'since', from],
  order: (id) => ['order', id],
  restaurants: ['restaurants'],
  menuItems: ['menu-items'],
  categories: ['categories'],
  offers: ['offers'],
  users: (params) => ['users', params],
  media: (params) => ['media', params],
}

// ------------------------------------------------------------- dashboard

export function useStats() {
  return useQuery({ queryKey: keys.stats, queryFn: () => api('/admin/stats'), ...LIVE })
}

/** Every order placed since `from` (ISO string) — used for charts. */
export function useOrdersSince(from) {
  return useQuery({
    queryKey: keys.ordersSince(from),
    queryFn: () => fetchAllPages('/admin/orders', { from }),
    ...LIVE,
  })
}

// ---------------------------------------------------------------- orders

export function useOrders(params) {
  return useQuery({
    queryKey: keys.orders(params),
    queryFn: () => api('/admin/orders', { query: params }),
    placeholderData: keepPreviousData,
    ...LIVE,
  })
}

export function useOrder(id) {
  return useQuery({
    queryKey: keys.order(id),
    queryFn: () => api(`/admin/orders/${id}`),
    enabled: id != null,
    ...LIVE,
  })
}

function useOrderMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (order) => {
      queryClient.setQueryData(keys.order(order.id), order)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: keys.stats })
    },
  })
}

export const useUpdateOrderStatus = () =>
  useOrderMutation(({ id, status, note }) => api(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status, note } }))

export const useUpdatePaymentStatus = () =>
  useOrderMutation(({ id, paymentStatus }) => api(`/admin/orders/${id}/payment`, { method: 'PATCH', body: { paymentStatus } }))

// --------------------------------------------------------------- catalogue

/** Generic list + create/update/delete for a simple admin resource. */
function useCrud(path, queryKey, { paged = false, alsoInvalidate = [] } = {}) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    ;[queryKey, keys.stats, ...alsoInvalidate].forEach((k) => queryClient.invalidateQueries({ queryKey: k }))
  }
  const list = useQuery({
    queryKey,
    queryFn: () => (paged ? fetchAllPages(path) : api(path)),
  })
  const save = useMutation({
    mutationFn: ({ id, ...body }) => api(id ? `${path}/${id}` : path, { method: id ? 'PATCH' : 'POST', body }),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id) => api(`${path}/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
  return { list, save, remove }
}

// Restaurant names/add-ons appear on menu item rows, and item counts on
// restaurants/categories, so related lists refresh together.
export const useRestaurants = () =>
  useCrud('/admin/restaurants', keys.restaurants, { paged: true, alsoInvalidate: [keys.menuItems] })
export const useMenuItems = () =>
  useCrud('/admin/menu-items', keys.menuItems, { paged: true, alsoInvalidate: [keys.restaurants, keys.categories] })
export const useCategories = () => useCrud('/admin/categories', keys.categories, { alsoInvalidate: [keys.menuItems] })
export const useOffers = () => useCrud('/admin/offers', keys.offers)

// ---------------------------------------------------------- users & more

export function useUsers(params) {
  return useQuery({
    queryKey: keys.users(params),
    queryFn: () => api('/admin/users', { query: params }),
    placeholderData: keepPreviousData,
  })
}

export function useSaveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }) => api(id ? `/admin/users/${id}` : '/admin/users', { method: id ? 'PATCH' : 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: keys.stats })
    },
  })
}

export function useSendNotification() {
  return useMutation({ mutationFn: (body) => api('/admin/notifications', { method: 'POST', body }) })
}

export function useUploadImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file) => {
      const form = new FormData()
      form.append('file', file)
      return api('/admin/uploads', { method: 'POST', form })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })
}

// ----------------------------------------------------------- media library

export function useMedia(params) {
  return useQuery({
    queryKey: keys.media(params),
    queryFn: () => api('/admin/uploads', { query: params }),
    placeholderData: keepPreviousData,
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api(`/admin/uploads/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })
}
