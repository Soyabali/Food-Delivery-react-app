import { Download, Plus } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorCard, LoadingCard } from '@/components/shared/QueryState'
import { useCategories, useMenuItems, useRestaurants } from '@/hooks/queries'
import { downloadCsv } from '@/lib/csv'
import { DishEditor } from '@/sections/menu/DishEditor'
import { MENU_PAGE_SIZE, MenuCatalogTable } from '@/sections/menu/MenuCatalogTable'
import { MenuFilterBar } from '@/sections/menu/MenuFilterBar'
import { PhonePreview } from '@/sections/menu/PhonePreview'

const NEW = 'new'

const csvColumns = [
  { header: 'ID', value: (i) => i.id },
  { header: 'Dish', value: (i) => i.name },
  { header: 'Restaurant', value: (i) => i.restaurantName },
  { header: 'Category', value: (i) => i.categoryName },
  { header: 'Diet', value: (i) => (i.isVeg ? 'Veg' : 'Non-Veg') },
  { header: 'Price (INR)', value: (i) => i.price },
  { header: 'Rating', value: (i) => i.rating },
  { header: 'In stock', value: (i) => (i.isAvailable ? 'Yes' : 'No') },
]

function blankDish(restaurantId) {
  return {
    restaurantId,
    categoryId: null,
    name: '',
    description: '',
    price: null,
    imageUrl: null,
    isVeg: true,
    isAvailable: true,
    hasSpiceLevels: false,
    allowsAddOns: true,
    mealTypes: ['Lunch', 'Dinner'],
    prepTimeMinutes: 20,
    calories: null,
    servings: 1,
    rating: 0,
    ratingCount: 0,
    badge: '',
    variants: [{ name: 'Regular (Serves 1)', subtitle: 'Standard single portion', priceDelta: 0, isDefault: true }],
  }
}

/** Editor draft → MenuItemIn / MenuItemPatch body. */
function toPayload(d) {
  return {
    restaurantId: d.restaurantId,
    categoryId: d.categoryId,
    name: d.name.trim(),
    description: d.description?.trim() || null,
    price: d.price,
    imageUrl: d.imageUrl || null,
    isVeg: d.isVeg,
    isAvailable: d.isAvailable,
    hasSpiceLevels: d.hasSpiceLevels,
    allowsAddOns: d.allowsAddOns,
    mealTypes: d.mealTypes,
    prepTimeMinutes: d.prepTimeMinutes,
    calories: d.calories,
    servings: d.servings,
    badge: d.badge?.trim() || null,
    variants: d.variants
      .filter((v) => v.name.trim())
      .map(({ id, name, subtitle, priceDelta, isDefault }, i) => ({ id, name: name.trim(), subtitle: subtitle?.trim() || null, priceDelta: priceDelta ?? 0, isDefault, sortOrder: i })),
  }
}

/**
 * Editor + preview for one dish. Keyed by dish id in the parent, so switching
 * dishes starts a fresh draft without any syncing effect.
 */
function DishWorkspace({ item, isNew, restaurants, categories, save, remove, onSaved, onDeleted, onCancelNew }) {
  const [draft, setDraft] = useState(item)
  const [baseline, setBaseline] = useState(item)
  const [variantIndex, setVariantIndex] = useState(() => Math.max(0, item.variants.findIndex((v) => v.isDefault)))
  const [savedAt, setSavedAt] = useState(null)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(baseline)
  const restaurant = restaurants.find((r) => r.id === draft.restaurantId)
  // The mutations are shared across dishes; only show errors that belong to this one.
  const ownId = isNew ? undefined : item.id
  const error = (save.isError && save.variables?.id === ownId && save.error) || (remove.isError && remove.variables === ownId && remove.error) || null

  async function handleSave() {
    try {
      const saved = await save.mutateAsync({ id: isNew ? undefined : item.id, ...toPayload(draft) })
      setDraft(saved)
      setBaseline(saved)
      setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }))
      onSaved(saved)
    } catch {
      // Shown in the editor from save.error.
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete “${item.name}”? Past orders keep their own copy of the dish.`)) return
    try {
      await remove.mutateAsync(item.id)
      onDeleted()
    } catch {
      // Shown in the editor from remove.error.
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-space-xl md:grid-cols-2 xl:grid-cols-1">
      <DishEditor
        draft={draft}
        onChange={setDraft}
        isNew={isNew}
        isDirty={isDirty}
        restaurants={restaurants}
        categories={categories}
        variantIndex={variantIndex}
        onVariantSelect={setVariantIndex}
        savedAt={savedAt}
        error={error}
        save={save}
        remove={remove}
        onDiscard={isNew ? onCancelNew : () => setDraft(baseline)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <PhonePreview draft={draft} restaurant={restaurant} variantIndex={variantIndex} onVariantSelect={setVariantIndex} />
    </div>
  )
}

export function MenuItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { list: items, save, remove } = useMenuItems()
  const { list: restaurants } = useRestaurants()
  const { list: categories } = useCategories()

  // ?restaurantId= comes from "View Menu" on a partner card, ?new=1 from "Add Dish".
  const [filters, setFilters] = useState(() => ({
    restaurantId: searchParams.get('restaurantId') ?? '',
    categoryId: '',
    diet: 'all',
    availableOnly: false,
    query: '',
  }))
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(() => (searchParams.get('new') === '1' ? NEW : null))
  const [togglingId, setTogglingId] = useState(null)

  const queries = [items, restaurants, categories]
  const failed = queries.find((q) => q.isError)
  if (failed) return <ErrorCard error={failed.error} onRetry={() => queries.forEach((q) => q.refetch())} />
  if (queries.some((q) => q.isPending)) return <LoadingCard label="Loading the menu catalogue…" />

  const q = filters.query.trim().toLowerCase()
  const visible = items.data
    .filter(
      (i) =>
        (!filters.restaurantId || i.restaurantId === Number(filters.restaurantId)) &&
        (!filters.categoryId || i.categoryId === Number(filters.categoryId)) &&
        (filters.diet === 'all' || i.isVeg === (filters.diet === 'veg')) &&
        (!filters.availableOnly || i.isAvailable) &&
        (!q || i.name.toLowerCase().includes(q) || String(i.id) === q),
    )
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
  const pageCount = Math.max(1, Math.ceil(visible.length / MENU_PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = visible.slice((currentPage - 1) * MENU_PAGE_SIZE, currentPage * MENU_PAGE_SIZE)

  const isNew = selectedId === NEW
  // With nothing picked, edit the first dish on screen.
  const selected = isNew ? null : (items.data.find((i) => i.id === selectedId) ?? pageItems[0])
  const workspaceItem = isNew ? blankDish(Number(filters.restaurantId) || restaurants.data[0]?.id) : selected

  const inStock = items.data.filter((i) => i.isAvailable).length
  const prepTimes = items.data.map((i) => i.prepTimeMinutes).filter(Boolean)
  const stats = [
    { label: 'Menu Health', value: items.data.length ? `${((inStock / items.data.length) * 100).toFixed(1)}%` : '—', suffix: 'In-Stock', tone: 'text-success' },
    { label: 'Avg Prep Time', value: prepTimes.length ? (prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length).toFixed(1) : '—', suffix: 'mins' },
    { label: 'Live Add-ons', value: restaurants.data.reduce((sum, r) => sum + r.addOns.filter((a) => a.isActive).length, 0), suffix: 'across kitchens', valueTone: 'text-primary' },
  ]

  function startNew() {
    setSelectedId(NEW)
    if (searchParams.has('new')) setSearchParams({}, { replace: true })
  }

  async function toggleStock(item, isAvailable) {
    setTogglingId(item.id)
    try {
      await save.mutateAsync({ id: item.id, isAvailable })
    } catch (error) {
      window.alert(error.message)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-space-xs text-label-sm tracking-wider text-on-surface-variant uppercase">
            Catalog Operations <span className="text-primary">•</span> Changes go live instantly
          </span>
        }
        title="Menu Items Catalog"
        description="Manage dishes, portions, pricing, availability and customer app previews"
        actions={
          <>
            <Button variant="neutral" className="shadow-sm" onClick={() => downloadCsv('apnafood-menu.csv', csvColumns, visible)}>
              <Download /> Export CSV
            </Button>
            <Button variant="primary" onClick={startNew} disabled={!restaurants.data.length}>
              <Plus /> Add New Dish
            </Button>
          </>
        }
      />

      <MenuFilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
        restaurants={[{ value: '', label: 'All Restaurants' }, ...restaurants.data.map((r) => ({ value: String(r.id), label: r.name }))]}
        categories={[{ value: '', label: 'All Categories' }, ...categories.data.map((c) => ({ value: String(c.id), label: `${c.emoji ?? ''} ${c.name}`.trim() }))]}
      />

      <div className="grid grid-cols-1 items-start gap-space-xl xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-space-lg xl:col-span-7">
          <MenuCatalogTable
            items={pageItems}
            total={visible.length}
            page={currentPage}
            onPageChange={setPage}
            selectedId={selected?.id}
            onSelect={setSelectedId}
            onToggleStock={toggleStock}
            togglingId={togglingId}
          />
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="flex flex-col p-space-md">
                <span className="text-label-sm text-on-surface-variant uppercase">{stat.label}</span>
                <div className="mt-1 flex items-baseline gap-space-xs">
                  <span className={`tabular font-display text-headline-lg ${stat.valueTone ?? 'text-on-surface'}`}>{stat.value}</span>
                  <span className={`text-label-sm ${stat.tone ?? 'text-on-surface-variant'}`}>{stat.suffix}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="min-w-0 xl:col-span-5">
          {workspaceItem && (
            <DishWorkspace
              key={isNew ? NEW : workspaceItem.id}
              item={workspaceItem}
              isNew={isNew}
              restaurants={restaurants.data}
              categories={categories.data}
              save={save}
              remove={remove}
              onSaved={(saved) => setSelectedId(saved.id)}
              onDeleted={() => setSelectedId(null)}
              onCancelNew={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
