import {
  Images,
  LayoutDashboard,
  Megaphone,
  ReceiptText,
  Settings,
  Shapes,
  Store,
  Tag,
  Users,
  UtensilsCrossed,
} from 'lucide-react'

// `badgeKey` lets the sidebar show live counts (from /admin/stats).
export const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: ReceiptText, badgeKey: 'activeOrders' },
  { to: '/restaurants', label: 'Restaurants', icon: Store },
  { to: '/menu-items', label: 'Menu Items', icon: UtensilsCrossed },
  { to: '/categories', label: 'Categories', icon: Shapes },
  { to: '/offers', label: 'Offers', icon: Tag },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Megaphone },
  { to: '/media-library', label: 'Media Library', icon: Images },
  { to: '/settings', label: 'Settings', icon: Settings },
]
