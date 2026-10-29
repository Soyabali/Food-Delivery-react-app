import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { CheckboxRow, FormAlert, FormField, NumberInput } from '@/components/shared/Form'
import { ImageField } from '@/components/shared/ImageField'
import { slugify } from '@/lib/format'

// Bengaluru city centre — the backend's own default reference point.
const emptyForm = {
  name: '',
  slug: '',
  description: '',
  cuisines: '',
  imageUrl: null,
  addressLine: '',
  latitude: 12.9716,
  longitude: 77.5946,
  deliveryTimeMin: 25,
  deliveryTimeMax: 35,
  costForOne: 250,
  deliveryFee: 30,
  badge: '',
  isPureVeg: false,
  hasSpiceLevels: false,
  isPopular: false,
  isActive: true,
  addOns: [],
}

const toForm = (r) => (r ? { ...emptyForm, ...r, cuisines: r.cuisines.join(', '), description: r.description ?? '', badge: r.badge ?? '', addressLine: r.addressLine ?? '' } : emptyForm)

/** Converts the form into the API's RestaurantIn / RestaurantPatch body. */
function toPayload(form) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    cuisines: form.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
    imageUrl: form.imageUrl || null,
    addressLine: form.addressLine.trim() || null,
    latitude: form.latitude,
    longitude: form.longitude,
    deliveryTimeMin: form.deliveryTimeMin,
    deliveryTimeMax: form.deliveryTimeMax,
    costForOne: form.costForOne,
    deliveryFee: form.deliveryFee ?? 0,
    badge: form.badge.trim() || null,
    isPureVeg: form.isPureVeg,
    hasSpiceLevels: form.hasSpiceLevels,
    isPopular: form.isPopular,
    isActive: form.isActive,
    addOns: form.addOns
      .filter((a) => a.name.trim())
      .map(({ id, name, subtitle, price, isActive }, i) => ({ id, name: name.trim(), subtitle: subtitle || null, price: price ?? 0, sortOrder: i, isActive })),
  }
}

function AddOnsEditor({ addOns, onChange }) {
  const update = (index, changes) => onChange(addOns.map((a, i) => (i === index ? { ...a, ...changes } : a)))
  return (
    <fieldset className="space-y-space-sm rounded-xl bg-surface-container-low p-space-md">
      <div className="flex items-center justify-between">
        <legend className="text-label-md tracking-wider text-on-surface uppercase">Add-ons</legend>
        <Button variant="ghost" size="sm" onClick={() => onChange([...addOns, { name: '', subtitle: '', price: 20, isActive: true }])}>
          <Plus /> Add
        </Button>
      </div>
      {addOns.length === 0 && <p className="text-body-sm text-on-surface-variant">No add-ons. Dishes from this kitchen can’t be customised.</p>}
      {addOns.map((addOn, index) => (
        <div key={addOn.id ?? `new-${index}`} className="flex items-center gap-space-sm">
          <input
            type="checkbox"
            className="size-4 shrink-0 accent-primary"
            checked={addOn.isActive}
            onChange={(e) => update(index, { isActive: e.target.checked })}
            aria-label={`${addOn.name || 'Add-on'} available`}
          />
          <Input className="h-9 bg-surface" placeholder="Mint Raita" value={addOn.name} onChange={(e) => update(index, { name: e.target.value })} aria-label="Add-on name" />
          <div className="relative w-24 shrink-0">
            <span className="absolute top-1/2 left-2 -translate-y-1/2 text-label-md text-on-surface-variant">₹</span>
            <NumberInput className="tabular h-9 bg-surface pl-5" min="0" value={addOn.price} onChange={(price) => update(index, { price })} aria-label="Add-on price" />
          </div>
          <button type="button" onClick={() => onChange(addOns.filter((_, i) => i !== index))} className="rounded p-1 text-on-surface-variant hover:text-tertiary" aria-label="Remove add-on">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </fieldset>
  )
}

/** The form body is keyed by partner, so it resets whenever a different one opens. */
function PartnerForm({ restaurant, save, remove, onDone }) {
  const [form, setForm] = useState(() => toForm(restaurant))
  const [slugTouched, setSlugTouched] = useState(Boolean(restaurant))
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const text = (key) => (e) => set(key)(e.target.value)
  const error = save.error ?? remove.error

  function setName(e) {
    const name = e.target.value
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    // Errors are shown from save.error; .catch keeps the drawer open.
    await save.mutateAsync({ id: restaurant?.id, ...toPayload(form) }).then(onDone, () => {})
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${restaurant.name}? Restaurants with past orders are hidden instead of deleted.`)) return
    await remove.mutateAsync(restaurant.id).then(onDone, () => {})
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col justify-between">
      <div className="space-y-space-md overflow-y-auto px-space-xl pb-space-lg">
        <FormAlert>{error?.message}</FormAlert>
        <FormField label="Restaurant name" htmlFor="partner-name">
          <Input id="partner-name" className="h-10 bg-surface" value={form.name} onChange={setName} required minLength={2} autoFocus />
        </FormField>
        <FormField label="URL slug" htmlFor="partner-slug" hint="Lowercase letters, numbers and dashes. Used in the app’s links.">
          <Input
            id="partner-slug"
            className="h-10 bg-surface"
            value={form.slug}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            onChange={(e) => {
              setSlugTouched(true)
              set('slug')(e.target.value)
            }}
            required
          />
        </FormField>
        <FormField label="Cuisines (comma separated)" htmlFor="partner-cuisines">
          <Input id="partner-cuisines" className="h-10 bg-surface" value={form.cuisines} onChange={text('cuisines')} placeholder="Biryani, Mughlai, Kebabs" />
        </FormField>
        <FormField label="Description" htmlFor="partner-description">
          <textarea
            id="partner-description"
            rows={2}
            className="w-full rounded-lg bg-surface px-space-md py-space-sm text-body-md focus:shadow-[0_0_0_3px_rgba(255,107,53,0.2)] focus:outline-none"
            value={form.description}
            onChange={text('description')}
          />
        </FormField>
        <FormField label="Cover image" htmlFor="partner-image">
          <ImageField id="partner-image" value={form.imageUrl} onChange={set('imageUrl')} />
        </FormField>
        <FormField label="Address" htmlFor="partner-address">
          <Input id="partner-address" className="h-10 bg-surface" value={form.addressLine} onChange={text('addressLine')} placeholder="12th Main, Indiranagar, Bengaluru" />
        </FormField>
        <div className="grid grid-cols-2 gap-space-md">
          <FormField label="Latitude" htmlFor="partner-lat">
            <NumberInput id="partner-lat" step="any" min="-90" max="90" value={form.latitude} onChange={set('latitude')} required />
          </FormField>
          <FormField label="Longitude" htmlFor="partner-lng">
            <NumberInput id="partner-lng" step="any" min="-180" max="180" value={form.longitude} onChange={set('longitude')} required />
          </FormField>
          <FormField label="Delivery time from (min)" htmlFor="partner-eta-min">
            <NumberInput id="partner-eta-min" min="1" max="180" value={form.deliveryTimeMin} onChange={set('deliveryTimeMin')} required />
          </FormField>
          <FormField label="to (min)" htmlFor="partner-eta-max">
            <NumberInput id="partner-eta-max" min={form.deliveryTimeMin || 1} max="240" value={form.deliveryTimeMax} onChange={set('deliveryTimeMax')} required />
          </FormField>
          <FormField label="Cost for one (₹)" htmlFor="partner-cost">
            <NumberInput id="partner-cost" min="0" value={form.costForOne} onChange={set('costForOne')} required />
          </FormField>
          <FormField label="Delivery fee (₹)" htmlFor="partner-fee">
            <NumberInput id="partner-fee" min="0" value={form.deliveryFee} onChange={set('deliveryFee')} />
          </FormField>
        </div>
        <FormField label="Badge" htmlFor="partner-badge" hint="Optional label on the card, e.g. Trending or Top Rated.">
          <Input id="partner-badge" className="h-10 bg-surface" maxLength={30} value={form.badge} onChange={text('badge')} />
        </FormField>

        <fieldset className="space-y-space-sm rounded-xl bg-surface-container-low p-space-md">
          <legend className="sr-only">Flags</legend>
          <CheckboxRow label="Live in the app" description="Customers can see and order from this kitchen." checked={form.isActive} onChange={set('isActive')} />
          <CheckboxRow label="Pure vegetarian outlet" checked={form.isPureVeg} onChange={set('isPureVeg')} />
          <CheckboxRow label="Offers spice levels" checked={form.hasSpiceLevels} onChange={set('hasSpiceLevels')} />
          <CheckboxRow label="Featured as popular" checked={form.isPopular} onChange={set('isPopular')} />
        </fieldset>

        <AddOnsEditor addOns={form.addOns} onChange={set('addOns')} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-space-md border-t border-surface-container px-space-xl py-space-lg">
        {restaurant && (
          <Button variant="ghost-danger" className="mr-auto" onClick={handleDelete} disabled={remove.isPending}>
            <Trash2 /> Delete
          </Button>
        )}
        <SheetClose asChild>
          <Button variant="neutral">Discard</Button>
        </SheetClose>
        <Button type="submit" variant="primary" size="lg" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />}
          {restaurant ? 'Save changes' : 'Register restaurant'}
        </Button>
      </div>
    </form>
  )
}

export function PartnerFormSheet({ open, onOpenChange, restaurant, save, remove }) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          save.reset()
          remove.reset()
        }
        onOpenChange(next)
      }}
    >
      <SheetContent>
        <div className="px-space-xl pt-space-xl pr-14 pb-space-lg">
          <SheetTitle>{restaurant ? `Update: ${restaurant.name}` : 'Register Kitchen Partner'}</SheetTitle>
          <SheetDescription>
            {restaurant ? 'Changes go live in the customer app immediately.' : 'Add a new kitchen to the Apna Food catalogue.'}
          </SheetDescription>
        </div>
        <PartnerForm key={restaurant?.id ?? 'new'} restaurant={restaurant} save={save} remove={remove} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
