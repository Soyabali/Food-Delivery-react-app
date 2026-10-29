import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/select'
import { CheckboxRow, FormAlert, NumberInput } from '@/components/shared/Form'
import { ImageField } from '@/components/shared/ImageField'
import { cn } from '@/lib/utils'

// Values already used in the database.
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Beverage', 'Appetizer', 'Side Dish']

function FieldGroup({ label, htmlFor, children, className }) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function VariantsEditor({ variants, onChange, selectedIndex, onSelect }) {
  const update = (index, changes) => onChange(variants.map((v, i) => (i === index ? { ...v, ...changes } : v)))
  const makeDefault = (index) => onChange(variants.map((v, i) => ({ ...v, isDefault: i === index })))
  const removeAt = (index) => {
    const next = variants.filter((_, i) => i !== index)
    // Keep exactly one default portion.
    if (variants[index].isDefault && next.length) next[0] = { ...next[0], isDefault: true }
    onChange(next)
  }

  return (
    <fieldset>
      <div className="mb-space-xs flex items-center justify-between">
        <legend className="text-label-sm text-on-surface-variant uppercase">Portion Options</legend>
        <button
          type="button"
          className="flex items-center gap-0.5 text-label-sm text-primary"
          onClick={() => onChange([...variants, { name: '', subtitle: '', priceDelta: 0, isDefault: variants.length === 0 }])}
        >
          <Plus className="size-3.5" aria-hidden="true" /> Add Portion
        </button>
      </div>
      {variants.length === 0 && <p className="text-body-sm text-on-surface-variant">Single portion at the base price.</p>}
      <div className="space-y-space-xs">
        {variants.map((v, index) => (
          <div
            key={v.id ?? `new-${index}`}
            className={cn('flex flex-wrap items-center gap-space-sm rounded-lg p-space-sm sm:flex-nowrap', index === selectedIndex ? 'bg-surface-container' : 'bg-surface-container-low')}
            onFocus={() => onSelect(index)}
          >
            <input
              type="radio"
              name="default-portion"
              className="accent-primary"
              checked={v.isDefault}
              onChange={() => makeDefault(index)}
              aria-label={`Make ${v.name || 'this portion'} the default`}
              title="Default portion"
            />
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-1 sm:grid-cols-2">
              <Input className="h-8 bg-surface-container-lowest" placeholder="Regular (Serves 1)" value={v.name} onChange={(e) => update(index, { name: e.target.value })} aria-label="Portion name" />
              <Input className="h-8 bg-surface-container-lowest" placeholder="Standard portion (500g)" value={v.subtitle ?? ''} onChange={(e) => update(index, { subtitle: e.target.value })} aria-label="Portion description" />
            </div>
            <div className="relative w-24 shrink-0">
              <span className="absolute top-1/2 left-2 -translate-y-1/2 text-label-sm text-primary">+₹</span>
              <NumberInput className="tabular h-8 bg-surface-container-lowest pl-7" min="0" value={v.priceDelta} onChange={(priceDelta) => update(index, { priceDelta })} aria-label="Extra price" />
            </div>
            <button type="button" onClick={() => removeAt(index)} className="rounded p-1 text-on-surface-variant hover:text-tertiary" aria-label="Remove portion">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

/** Controlled form; every change goes to the parent so the phone preview updates live. */
export function DishEditor({ draft, onChange, isNew, isDirty, restaurants, categories, variantIndex, onVariantSelect, onDiscard, onSave, onDelete, save, remove, savedAt, error }) {
  const set = (key) => (value) => onChange({ ...draft, [key]: value })
  const toggleMealType = (type) =>
    set('mealTypes')(draft.mealTypes.includes(type) ? draft.mealTypes.filter((t) => t !== type) : [...draft.mealTypes, type])

  return (
    <Card
      as="form"
      className="flex flex-col gap-space-lg p-space-lg"
      onSubmit={(e) => {
        e.preventDefault()
        onSave()
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
        <div className="flex min-w-0 items-center gap-space-xs">
          <span className={cn('size-2.5 shrink-0 rounded-full', isDirty ? 'animate-pulse bg-primary' : 'bg-success')} />
          <h2 className="truncate text-headline-sm text-on-surface">{isNew ? 'New Dish' : `Edit Dish: ${draft.name}`}</h2>
        </div>
        {!isNew && <span className="rounded bg-surface-container px-space-sm py-0.5 text-label-sm text-on-surface-variant">ID: {draft.id}</span>}
      </div>

      <FormAlert>{error?.message}</FormAlert>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
        <FieldGroup label="Dish Title" htmlFor="dish-title" className="sm:col-span-2">
          <Input id="dish-title" value={draft.name} onChange={(e) => set('name')(e.target.value)} required minLength={2} />
        </FieldGroup>
        <FieldGroup label="Base Price (₹)" htmlFor="dish-price">
          <div className="relative">
            <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-label-md text-on-surface-variant">₹</span>
            <NumberInput id="dish-price" className="tabular h-9 bg-surface-container-low pl-6" min="1" step="any" value={draft.price} onChange={set('price')} required />
          </div>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <FieldGroup label="Restaurant" htmlFor="dish-restaurant">
          <NativeSelect
            id="dish-restaurant"
            selectClassName="text-body-md font-normal"
            options={restaurants.map((r) => ({ value: String(r.id), label: r.name }))}
            value={String(draft.restaurantId)}
            onChange={(e) => set('restaurantId')(Number(e.target.value))}
          />
        </FieldGroup>
        <FieldGroup label="Category" htmlFor="dish-category">
          <NativeSelect
            id="dish-category"
            selectClassName="text-body-md font-normal"
            options={[{ value: '', label: 'Uncategorised' }, ...categories.map((c) => ({ value: String(c.id), label: `${c.emoji ?? ''} ${c.name}`.trim() }))]}
            value={draft.categoryId ? String(draft.categoryId) : ''}
            onChange={(e) => set('categoryId')(e.target.value ? Number(e.target.value) : null)}
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <FieldGroup label="Dietary Type">
          <div role="radiogroup" aria-label="Dietary type" className="grid h-9 grid-cols-2 gap-2">
            {[
              { value: true, label: 'Veg', active: 'bg-success text-on-primary', dot: 'bg-success' },
              { value: false, label: 'Non-Veg', active: 'bg-tertiary text-on-tertiary', dot: 'bg-tertiary' },
            ].map((option) => {
              const active = draft.isVeg === option.value
              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set('isVeg')(option.value)}
                  className={cn(
                    'flex items-center justify-center gap-1 rounded-lg text-label-md transition-colors',
                    active ? cn(option.active, 'font-bold shadow-sm') : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
                  )}
                >
                  <span className={cn('size-2 rounded-full', active ? 'bg-white' : option.dot)} /> {option.label}
                </button>
              )
            })}
          </div>
        </FieldGroup>
        <FieldGroup label="Badge" htmlFor="dish-badge">
          <Input id="dish-badge" maxLength={30} placeholder="e.g. Bestseller" value={draft.badge ?? ''} onChange={(e) => set('badge')(e.target.value)} />
        </FieldGroup>
      </div>

      <FieldGroup label="Meal Types">
        <div className="flex flex-wrap items-center gap-1.5">
          {MEAL_TYPES.map((type) => {
            const active = draft.mealTypes.includes(type)
            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                onClick={() => toggleMealType(type)}
                className={cn(
                  'rounded px-space-sm py-1 text-label-sm transition-colors',
                  active ? 'bg-secondary-fixed text-primary' : 'bg-surface-container-low font-semibold text-on-surface-variant hover:bg-surface-container',
                )}
              >
                {active ? type : `+ ${type}`}
              </button>
            )
          })}
        </div>
      </FieldGroup>

      <div className="grid grid-cols-3 gap-space-sm rounded-lg bg-surface-container-low p-space-sm">
        <FieldGroup label="Prep (min)" htmlFor="dish-prep">
          <NumberInput id="dish-prep" className="tabular h-9 bg-surface-container-lowest" min="0" max="600" value={draft.prepTimeMinutes} onChange={set('prepTimeMinutes')} />
        </FieldGroup>
        <FieldGroup label="Calories" htmlFor="dish-calories">
          <NumberInput id="dish-calories" className="tabular h-9 bg-surface-container-lowest" min="0" value={draft.calories} onChange={set('calories')} />
        </FieldGroup>
        <FieldGroup label="Serves" htmlFor="dish-servings">
          <NumberInput id="dish-servings" className="tabular h-9 bg-surface-container-lowest" min="1" max="50" value={draft.servings} onChange={set('servings')} />
        </FieldGroup>
      </div>

      <FieldGroup label="Description" htmlFor="dish-description">
        <textarea
          id="dish-description"
          rows={2}
          className="w-full rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-md focus:bg-surface-container-lowest focus:shadow-[0_0_0_3px_rgba(255,107,53,0.2)] focus:outline-none"
          value={draft.description ?? ''}
          onChange={(e) => set('description')(e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Photo" htmlFor="dish-image">
        <ImageField id="dish-image" value={draft.imageUrl} onChange={set('imageUrl')} />
      </FieldGroup>

      <VariantsEditor variants={draft.variants} onChange={set('variants')} selectedIndex={variantIndex} onSelect={onVariantSelect} />

      <div className="space-y-space-sm rounded-lg bg-surface-container-low p-space-md">
        <CheckboxRow label="In stock" description="Customers can order this dish right now." checked={draft.isAvailable} onChange={set('isAvailable')} />
        <CheckboxRow label="Spice level choice" description="Customers pick mild / medium / spicy." checked={draft.hasSpiceLevels} onChange={set('hasSpiceLevels')} />
        <CheckboxRow label="Allow restaurant add-ons" checked={draft.allowsAddOns} onChange={set('allowsAddOns')} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-space-md pt-space-sm">
        {!isNew && (
          <Button variant="ghost-danger" className="mr-auto" onClick={onDelete} disabled={remove.isPending}>
            <Trash2 /> Delete
          </Button>
        )}
        {savedAt && !isDirty && <span className="text-label-md text-success">Saved at {savedAt}</span>}
        <Button variant="neutral" className="text-on-surface-variant" onClick={onDiscard} disabled={!isDirty && !isNew}>
          {isNew ? 'Cancel' : 'Discard Changes'}
        </Button>
        <Button type="submit" variant="deep" disabled={save.isPending || (!isDirty && !isNew)}>
          {save.isPending && <Loader2 className="animate-spin" />}
          {isNew ? 'Create Dish' : 'Save & Publish to Live'}
        </Button>
      </div>
    </Card>
  )
}
