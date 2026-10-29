import { Megaphone, Store, Tag, UtensilsCrossed, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'

const actions = [
  { to: '/menu-items?new=1', title: 'Add Dish Item', text: 'Configure price, tags, prep SLA', icon: UtensilsCrossed, tone: 'bg-secondary-fixed text-primary' },
  { to: '/restaurants?register=1', title: 'Add Restaurant', text: 'Onboard partner & kitchen hub', icon: Store, tone: 'bg-surface-container-high text-on-surface' },
  { to: '/offers', title: 'Create Offer Coupon', text: 'Set discount thresholds & expiry', icon: Tag, tone: 'bg-tertiary-fixed text-tertiary' },
  { to: '/notifications', title: 'Broadcast Alert', text: 'Push delay alert or rush warning', icon: Megaphone, tone: 'bg-surface-container text-on-surface-variant' },
]

export function QuickActions() {
  return (
    <Card className="p-space-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-primary" aria-hidden="true" />
          <h3 className="text-headline-sm text-on-surface">Operational Accelerators &amp; Quick Dispatch</h3>
        </div>
        <span className="text-label-sm text-on-surface-variant">Instant Admin Actions</span>
      </div>
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ to, title, text, icon: Icon, tone }) => (
          <Link
            key={title}
            to={to}
            className="group flex items-center gap-space-md rounded-xl bg-surface p-space-md text-left transition-all hover:bg-surface-container"
          >
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${tone}`}>
              <Icon className="size-[22px]" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-label-lg text-on-surface transition-colors group-hover:text-primary">{title}</span>
              <span className="block truncate text-body-sm text-on-surface-variant">{text}</span>
            </span>
          </Link>
        ))}
      </div>
    </Card>
  )
}
