import { ArrowUpDown, ImageOff, Pencil, SearchX } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { DietMarker } from '@/components/shared/DietMarker'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { cn, formatINR } from '@/lib/utils'

export const MENU_PAGE_SIZE = 10

export function DishThumb({ src, className }) {
  return src ? (
    <img src={src} alt="" className={cn('size-12 rounded-lg object-cover shadow-sm', className)} loading="lazy" />
  ) : (
    <span className={cn('flex size-12 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant', className)}>
      <ImageOff className="size-4" aria-hidden="true" />
    </span>
  )
}

export function MenuCatalogTable({ items, total, page, onPageChange, selectedId, onSelect, onToggleStock, togglingId }) {
  const pageCount = Math.max(1, Math.ceil(total / MENU_PAGE_SIZE))
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-space-sm bg-surface-container-low px-space-lg py-space-md">
        <div className="flex items-center gap-space-sm">
          <h2 className="text-headline-sm text-on-surface">Dishes</h2>
          <span className="rounded-full bg-secondary-fixed px-space-sm py-0.5 text-label-sm text-primary">
            {total} {total === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        <span className="flex items-center gap-space-xs text-label-sm text-on-surface-variant">
          <ArrowUpDown className="size-4" aria-hidden="true" /> Sort: Top Rated
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={SearchX} title="No dishes match these filters" className="py-space-xl">
          Clear the search or switch filters to see more dishes.
        </EmptyState>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container text-label-sm text-on-surface-variant uppercase">
                <th className="w-16 px-space-md py-space-sm">Item</th>
                <th className="px-space-md py-space-sm">Dish Details</th>
                <th className="hidden px-space-md py-space-sm sm:table-cell">Kitchen / Cat</th>
                <th className="px-space-md py-space-sm text-right">Price</th>
                <th className="hidden px-space-md py-space-sm text-center md:table-cell">Score</th>
                <th className="px-space-md py-space-sm text-center">Stock</th>
                <th className="hidden px-space-md py-space-sm text-right sm:table-cell">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant text-on-surface">
              {items.map((item) => {
                const selected = item.id === selectedId
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'group cursor-pointer transition-colors',
                      selected ? 'bg-surface-container-low hover:bg-surface-container' : 'bg-surface-container-lowest hover:bg-surface-container-low',
                      !item.isAvailable && 'opacity-60',
                    )}
                  >
                    <td className="px-space-md py-space-sm">
                      <DishThumb src={item.imageUrl} />
                    </td>
                    <td className="min-w-[150px] px-space-md py-space-sm">
                      <div className="flex items-center gap-1.5">
                        <DietMarker diet={item.isVeg ? 'veg' : 'nonveg'} size="sm" />
                        <span className={cn('text-label-lg font-bold', selected ? 'text-primary group-hover:underline' : 'group-hover:text-primary')}>
                          {item.name}
                        </span>
                      </div>
                      {selected ? (
                        <span className="mt-0.5 block text-label-sm tracking-wide text-primary uppercase">Currently Editing</span>
                      ) : (
                        <span className="text-body-sm text-on-surface-variant">{item.badge ?? item.cuisine ?? `#${item.id}`}</span>
                      )}
                    </td>
                    <td className="hidden px-space-md py-space-sm sm:table-cell">
                      <div className="max-w-[130px] truncate text-label-md">{item.restaurantName}</div>
                      <span className="text-body-sm text-on-surface-variant">{item.categoryName ?? 'Uncategorised'}</span>
                    </td>
                    <td className="tabular px-space-md py-space-sm text-right font-display text-headline-sm whitespace-nowrap">{formatINR(item.price)}</td>
                    <td className="hidden px-space-md py-space-sm text-center md:table-cell">
                      <span className={cn('inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-label-sm', selected ? 'bg-surface-container-highest' : 'bg-surface-container-low')}>
                        <span className="text-amber-500">★</span> {item.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-space-md py-space-sm text-center" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={item.isAvailable}
                        disabled={togglingId === item.id}
                        onCheckedChange={(checked) => onToggleStock(item, checked)}
                        aria-label={`${item.name} in stock`}
                      />
                    </td>
                    <td className="hidden px-space-md py-space-sm text-right sm:table-cell">
                      <span className={cn('inline-flex rounded p-1', selected ? 'bg-secondary-fixed text-primary' : 'text-on-surface-variant')}>
                        <Pencil className="size-4" aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-space-md text-label-sm text-on-surface-variant">
        <span>
          Showing {total ? (page - 1) * MENU_PAGE_SIZE + 1 : 0}–{Math.min(page * MENU_PAGE_SIZE, total)} of {total} dishes
        </span>
        {pageCount > 1 && <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />}
      </div>
    </Card>
  )
}
