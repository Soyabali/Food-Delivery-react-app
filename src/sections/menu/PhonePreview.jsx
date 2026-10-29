import { ArrowLeft, ArrowRight, BatteryFull, ImageOff, Share2, Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** How the dish appears in the consumer app, driven by the editor draft. */
export function PhonePreview({ draft, restaurant, variantIndex, onVariantSelect }) {
  const base = Number(draft.price) || 0
  const variant = draft.variants[variantIndex] ?? draft.variants.find((v) => v.isDefault)
  const price = base + (variant?.priceDelta ?? 0)
  const addOns = draft.allowsAddOns ? (restaurant?.addOns ?? []).filter((a) => a.isActive) : []

  return (
    <Card className="flex flex-col items-center p-space-lg">
      <div className="mb-space-md flex w-full flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <Smartphone className="size-[18px] text-primary" aria-hidden="true" />
          <h2 className="text-headline-sm text-on-surface">Live Customer Preview</h2>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-label-sm text-success">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-600" /> Updates as you type
        </span>
      </div>

      <div className="w-full max-w-[320px] rounded-[36px] bg-inverse-surface p-3 shadow-2xl select-none">
        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-surface-container-lowest text-left text-on-surface">
          <div className="relative z-20 flex h-6 items-center justify-between px-4 text-[10px] font-bold">
            <span>9:41</span>
            <span className="absolute top-1.5 left-1/2 h-3 w-16 -translate-x-1/2 rounded-full bg-inverse-surface" />
            <span className="flex items-center gap-1">
              5G <BatteryFull className="size-3" aria-hidden="true" />
            </span>
          </div>

          <div className="no-scrollbar flex h-[460px] flex-col overflow-y-auto">
            <div className="relative h-44 w-full shrink-0 bg-surface-container">
              {draft.imageUrl ? (
                <img src={draft.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-on-surface-variant">
                  <ImageOff className="size-8" aria-hidden="true" />
                </span>
              )}
              <span className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-surface-container-lowest/80 shadow-sm backdrop-blur-md">
                <ArrowLeft className="size-3.5" aria-hidden="true" />
              </span>
              <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-surface-container-lowest/80 shadow-sm backdrop-blur-md">
                <Share2 className="size-3.5" aria-hidden="true" />
              </span>
              <span className="absolute bottom-2 left-3 flex items-center gap-1 rounded bg-surface-container-lowest/90 px-2 py-0.5 shadow-sm backdrop-blur-md">
                <span className={cn('size-1.5', draft.isVeg ? 'rounded-full bg-success' : 'rounded-[1px] bg-tertiary')} />
                <span className={cn('text-[10px] font-bold uppercase', draft.isVeg ? 'text-success' : 'text-tertiary')}>{draft.isVeg ? 'Veg' : 'Non-Veg'}</span>
              </span>
              {draft.badge && (
                <span className="absolute right-3 bottom-2 rounded bg-primary-container px-2 py-0.5 text-[10px] font-bold text-on-primary uppercase">{draft.badge}</span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-3">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h3 className="text-headline-sm leading-tight font-bold break-words">{draft.name || 'Untitled dish'}</h3>
                  <span className="text-[11px] font-medium text-on-surface-variant">
                    {restaurant?.name ?? '—'}
                    {draft.prepTimeMinutes ? ` • ${draft.prepTimeMinutes} mins` : ''}
                  </span>
                </div>
                <span className="tabular shrink-0 font-display text-headline-md font-extrabold">₹{base}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-on-surface-variant">
                {draft.rating > 0 && <span className="rounded bg-success px-1.5 py-0.5 text-[10px] font-bold text-on-primary">★ {draft.rating.toFixed(1)}</span>}
                {draft.ratingCount > 0 && <span>({draft.ratingCount} reviews)</span>}
                {draft.hasSpiceLevels && <span>• Choose spice 🌶️</span>}
                {draft.calories ? <span>• {draft.calories} kcal</span> : null}
              </div>

              {draft.description && <p className="mt-2 line-clamp-3 text-[11px] text-on-surface-variant">{draft.description}</p>}

              {draft.variants.length > 0 && (
                <div className="mt-4">
                  <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Select Portion</span>
                  <div className="grid grid-cols-2 gap-2">
                    {draft.variants.map((v, i) => {
                      const active = v === variant
                      return (
                        <button
                          key={v.id ?? `new-${i}`}
                          type="button"
                          onClick={() => onVariantSelect(i)}
                          className={cn('flex flex-col rounded-lg border p-2 text-left', active ? 'border-primary/20 bg-secondary-fixed/50' : 'border-transparent bg-surface-container-low')}
                        >
                          <span className="flex items-center justify-between gap-1 text-[11px]">
                            <span className={cn('truncate', active ? 'font-bold' : 'font-medium')}>{v.name || 'Portion'}</span>
                            <span className={cn('size-2 shrink-0 rounded-full', active ? 'bg-primary' : 'bg-surface-variant')} />
                          </span>
                          <span className="tabular mt-0.5 text-[10px] text-on-surface-variant">₹{base + (v.priceDelta ?? 0)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {addOns.length > 0 && (
                <div className="mt-3 border-t border-surface-container pt-2">
                  <span className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">Add-ons</span>
                  <ul className="flex flex-col gap-1.5 text-[11px]">
                    {addOns.map((addOn) => (
                      <li key={addOn.id} className="flex items-center justify-between">
                        <span>{addOn.name}</span>
                        <span className="font-semibold text-primary">+₹{addOn.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 z-10 border-t border-surface-container bg-surface-container-lowest p-3">
              <div className={cn('flex h-10 w-full items-center justify-between rounded-xl px-3 text-label-md text-on-primary shadow-md', draft.isAvailable ? 'bg-brand-gradient' : 'bg-outline')}>
                <span className="font-semibold">{draft.isAvailable ? '1 item selected' : 'Currently unavailable'}</span>
                {draft.isAvailable && (
                  <span className="tabular flex items-center gap-1 font-bold">
                    Add to Cart - ₹{price} <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex h-3 items-center justify-center">
            <span className="h-1 w-24 rounded-full bg-on-surface/20" />
          </div>
        </div>
      </div>
    </Card>
  )
}
