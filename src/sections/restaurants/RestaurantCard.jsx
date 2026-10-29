import { Award, Clock, Flame, Leaf, MapPin, Sparkles, Star, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

/** Top-left pill: explicit badge text first, then popular / pure-veg flags. */
function getBadge(r) {
  if (r.badge) {
    const icon = /trend|popular/i.test(r.badge) ? Flame : /top|rated|legend/i.test(r.badge) ? Award : Sparkles
    return { label: r.badge, icon, tone: 'bg-primary-container text-on-primary' }
  }
  if (r.isPopular) return { label: 'Popular', icon: Flame, tone: 'bg-primary-container text-on-primary' }
  if (r.isPureVeg) return { label: 'Pure Veg', icon: Leaf, tone: 'bg-success-container text-success backdrop-blur-md' }
  return null
}

function CoverImage({ restaurant: r, className }) {
  const badge = getBadge(r)
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-surface-container-low', className)}>
      {r.imageUrl ? (
        <img src={r.imageUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="flex size-full items-center justify-center bg-brand-gradient text-white/90">
          <Store className="size-12" strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {badge && (
        <span className={cn('absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm shadow-sm', badge.tone)}>
          <badge.icon className="size-3.5" aria-hidden="true" />
          {badge.label}
        </span>
      )}
      {r.rating > 0 && (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-0.5 rounded-full bg-success px-2.5 py-1 text-label-md text-white shadow-sm">
          <Star className="size-3.5 fill-current" aria-hidden="true" />
          {r.rating.toFixed(1)}
        </span>
      )}
      <div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between gap-1 text-label-sm text-white">
        <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-md">
          <Clock className="size-3.5" aria-hidden="true" />
          {r.deliveryTimeMin}-{r.deliveryTimeMax} mins
        </span>
        <span className="rounded-full bg-black/40 px-2 py-0.5 text-label-md backdrop-blur-md">₹{r.costForOne} for one</span>
      </div>
    </div>
  )
}

/** Partner card. `layout="list"` puts the cover beside the details on wider screens. */
export function RestaurantCard({ restaurant: r, layout = 'grid', onEdit, onToggleActive, toggling }) {
  const list = layout === 'list'
  return (
    <Card as="article" className={cn('group relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-md', !r.isActive && 'opacity-75')}>
      <div className={cn('p-space-lg', list && 'sm:flex sm:gap-space-lg')}>
        <CoverImage restaurant={r} className={cn('mb-space-md h-44 w-full', list && 'sm:mb-0 sm:h-36 sm:w-64 sm:shrink-0')} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-space-sm">
            <h2 className="truncate text-headline-md text-on-surface">{r.name}</h2>
            <Switch
              className="mt-1"
              checked={r.isActive}
              disabled={toggling}
              onCheckedChange={(checked) => onToggleActive(r, checked)}
              aria-label={`${r.name} visible to customers`}
              title={r.isActive ? 'Live in the app — click to hide' : 'Hidden from the app — click to go live'}
            />
          </div>
          <p className="truncate text-body-sm text-on-surface-variant">{r.cuisines.join(' • ') || 'No cuisines listed'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-space-xs text-label-sm text-on-surface-variant">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            <span className="truncate">{r.addressLine || 'No address'}</span>
            <span className="text-surface-variant">•</span>
            <span className="text-label-md text-on-surface">{r.deliveryFee ? `Delivery ₹${r.deliveryFee}` : 'Free delivery'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-b-xl bg-surface-container-low p-space-md">
        <span className="flex items-center gap-1.5 text-label-md text-on-surface">
          <span className={cn('size-2 rounded-full', r.isActive ? 'bg-success' : 'bg-outline')} />
          {r.isActive ? `${r.menuItemCount} ${r.menuItemCount === 1 ? 'dish' : 'dishes'}` : 'Hidden from app'}
        </span>
        <div className="flex items-center gap-space-xs">
          <Button variant="outline" size="sm" className="shadow-none" onClick={() => onEdit(r)}>
            Edit Partner
          </Button>
          <Button asChild variant="solid" size="sm">
            <Link to={`/menu-items?restaurantId=${r.id}`}>View Menu</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
