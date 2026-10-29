import { Flame, LayoutGrid, Leaf, List, Plus, Search, Star, Store } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IconInput } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { QueryState } from '@/components/shared/QueryState'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { useRestaurants } from '@/hooks/queries'
import { cn } from '@/lib/utils'
import { PartnerFormSheet } from '@/sections/restaurants/PartnerFormSheet'
import { PartnerKpis } from '@/sections/restaurants/PartnerKpis'
import { RestaurantCard } from '@/sections/restaurants/RestaurantCard'

const TOP_RATED = 4.5

const statusFilters = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'live', label: 'Live', test: (r) => r.isActive },
  { id: 'hidden', label: 'Hidden', test: (r) => !r.isActive },
]

const tagFilters = [
  { id: 'all', label: 'Any', test: () => true },
  { id: 'veg', label: 'Pure Veg', icon: Leaf, iconClass: 'text-success', test: (r) => r.isPureVeg },
  { id: 'popular', label: 'Popular', icon: Flame, iconClass: 'text-primary', test: (r) => r.isPopular },
  { id: 'toprated', label: `Top Rated (${TOP_RATED}+)`, icon: Star, iconClass: 'text-warning', test: (r) => r.rating >= TOP_RATED },
]

const viewOptions = [
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
]

function FilterPills({ label, options, value, onChange, activeClass }) {
  return (
    <div className="no-scrollbar flex items-center gap-space-xs overflow-x-auto" role="radiogroup" aria-label={label}>
      {options.map(({ id, label: text, icon: Icon, iconClass }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={cn(
            'flex items-center gap-1 rounded-full px-space-md py-1.5 text-label-md whitespace-nowrap transition-colors',
            value === id ? activeClass : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
          )}
        >
          {Icon && <Icon className={cn('size-3.5', value !== id && iconClass)} aria-hidden="true" />}
          {text}
        </button>
      ))}
    </div>
  )
}

export function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { list, save, remove } = useRestaurants()
  const [status, setStatus] = useState('all')
  const [tag, setTag] = useState('all')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [togglingId, setTogglingId] = useState(null)
  // ?register=1 (Overview quick actions) opens the drawer directly.
  const [sheet, setSheet] = useState(() => ({ open: searchParams.get('register') === '1', restaurant: null }))

  function handleSheetChange(open) {
    setSheet((s) => ({ ...s, open }))
    if (!open && searchParams.has('register')) setSearchParams({}, { replace: true })
  }

  async function toggleActive(restaurant, isActive) {
    setTogglingId(restaurant.id)
    try {
      await save.mutateAsync({ id: restaurant.id, isActive })
    } catch (error) {
      window.alert(error.message)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <QueryState query={list} loading={<Card className="h-36 animate-pulse" />}>
        {(restaurants) => <PartnerKpis restaurants={restaurants} />}
      </QueryState>

      <PageHeader
        title="Restaurant Partners"
        badge={
          list.data && (
            <span className="rounded-full bg-surface-container px-space-sm py-0.5 text-label-sm text-on-surface-variant">
              {list.data.length} Total
            </span>
          )
        }
        description="Manage kitchens, delivery promises, pricing, add-ons and visibility in the customer app"
        actions={
          <>
            <SegmentedControl
              label="Layout"
              options={viewOptions}
              value={view}
              onChange={setView}
              className="bg-surface-container-low"
              itemClassName="px-space-md py-1.5 text-label-lg"
            />
            <Button variant="primary" size="lg" className="text-headline-sm" onClick={() => setSheet({ open: true, restaurant: null })}>
              <Plus className="size-5" /> Register Restaurant
            </Button>
          </>
        }
      />

      <Card className="flex flex-col items-stretch justify-between gap-space-md p-space-md xl:flex-row xl:items-center">
        <IconInput
          icon={Search}
          className="flex-1 xl:max-w-sm"
          inputClassName="h-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurant, cuisine, or address..."
          aria-label="Search restaurants"
        />
        <FilterPills label="Visibility" options={statusFilters} value={status} onChange={setStatus} activeClass="bg-primary-container text-on-primary" />
        <span className="hidden h-6 w-px bg-surface-container xl:block" />
        <FilterPills label="Tags" options={tagFilters} value={tag} onChange={setTag} activeClass="bg-surface-container text-on-surface" />
      </Card>

      <QueryState query={list}>
        {(restaurants) => {
          const q = query.trim().toLowerCase()
          const statusTest = statusFilters.find((f) => f.id === status).test
          const tagTest = tagFilters.find((f) => f.id === tag).test
          const visible = restaurants.filter(
            (r) =>
              statusTest(r) &&
              tagTest(r) &&
              (!q || [r.name, r.cuisines.join(' '), r.addressLine ?? ''].some((field) => field.toLowerCase().includes(q))),
          )
          if (visible.length === 0) {
            return (
              <Card className="p-space-xl">
                <EmptyState icon={Store} title={restaurants.length ? 'No partners match these filters' : 'No restaurants yet'}>
                  {restaurants.length ? 'Clear the search or choose another filter.' : 'Register your first kitchen to start taking orders.'}
                </EmptyState>
              </Card>
            )
          }
          return (
            <div className={cn('grid gap-space-lg', view === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
              {visible.map((r) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  layout={view}
                  onEdit={(restaurant) => setSheet({ open: true, restaurant })}
                  onToggleActive={toggleActive}
                  toggling={togglingId === r.id}
                />
              ))}
            </div>
          )
        }}
      </QueryState>

      <PartnerFormSheet open={sheet.open} onOpenChange={handleSheetChange} restaurant={sheet.restaurant} save={save} remove={remove} />
    </div>
  )
}
