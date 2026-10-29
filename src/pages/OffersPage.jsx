import { CalendarRange, Pencil, Plus, Star, Tag, Users } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { EmptyState } from '@/components/shared/EmptyState'
import { CheckboxRow, FormField, NumberInput } from '@/components/shared/Form'
import { FormSheet } from '@/components/shared/FormSheet'
import { ImageField } from '@/components/shared/ImageField'
import { PageHeader } from '@/components/shared/PageHeader'
import { QueryState } from '@/components/shared/QueryState'
import { useOffers } from '@/hooks/queries'
import { formatDate } from '@/lib/format'
import { cn, formatINR } from '@/lib/utils'

const emptyOffer = {
  code: '',
  title: '',
  subtitle: '',
  description: '',
  discountType: 'percent',
  value: 10,
  maxDiscount: null,
  minOrder: 0,
  validForFirstNOrders: null,
  imageUrl: null,
  isFeatured: false,
  isActive: true,
  startsAt: '',
  endsAt: '',
}

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time.
const toLocalInput = (iso) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')
const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null)

function discountLabel(o) {
  return o.discountType === 'percent' ? `${o.value}% OFF` : `${formatINR(o.value, { decimals: false })} OFF`
}

function OfferForm({ offer, save, remove, onDone }) {
  const [form, setForm] = useState(() =>
    offer ? { ...emptyOffer, ...offer, description: offer.description ?? '', startsAt: toLocalInput(offer.startsAt), endsAt: toLocalInput(offer.endsAt) } : emptyOffer,
  )
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const text = (key) => (e) => set(key)(e.target.value)

  function submit() {
    const body = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim() || null,
      discountType: form.discountType,
      value: form.value,
      maxDiscount: form.discountType === 'percent' ? form.maxDiscount : null,
      minOrder: form.minOrder ?? 0,
      validForFirstNOrders: form.validForFirstNOrders || null,
      imageUrl: form.imageUrl || null,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      startsAt: fromLocalInput(form.startsAt),
      endsAt: fromLocalInput(form.endsAt),
    }
    // The code can't be changed after creation (OfferPatch has no `code`).
    save.mutateAsync(offer ? { id: offer.id, ...body } : { ...body, code: form.code.trim().toUpperCase() }).then(onDone, () => {})
  }

  const handleDelete = () => {
    if (!window.confirm(`Delete offer ${offer.code}?`)) return
    remove.mutateAsync(offer.id).then(onDone, () => {})
  }

  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onDone()}
      title={offer ? `Edit ${offer.code}` : 'New offer'}
      description="Coupons customers can apply at checkout."
      onSubmit={submit}
      submitLabel={offer ? 'Save changes' : 'Create offer'}
      pending={save.isPending}
      error={save.error ?? remove.error}
      onDelete={offer ? handleDelete : undefined}
      deleting={remove.isPending}
    >
      <FormField label="Coupon code" htmlFor="offer-code" hint={offer ? 'Codes can’t be changed after creation.' : 'Letters and numbers only, e.g. APNA50.'}>
        <Input
          id="offer-code"
          className="h-10 bg-surface font-bold tracking-wider uppercase"
          pattern="[A-Za-z0-9]{3,30}"
          value={form.code}
          onChange={text('code')}
          disabled={Boolean(offer)}
          required
          autoFocus={!offer}
        />
      </FormField>
      <FormField label="Title" htmlFor="offer-title">
        <Input id="offer-title" className="h-10 bg-surface" maxLength={80} value={form.title} onChange={text('title')} placeholder="50% off your first order" required />
      </FormField>
      <FormField label="Subtitle" htmlFor="offer-subtitle">
        <Input id="offer-subtitle" className="h-10 bg-surface" maxLength={150} value={form.subtitle} onChange={text('subtitle')} placeholder="Up to ₹100 on orders above ₹199" required />
      </FormField>
      <div className="grid grid-cols-2 gap-space-md">
        <FormField label="Discount type" htmlFor="offer-type">
          <NativeSelect
            id="offer-type"
            selectClassName="h-10 bg-surface font-normal text-body-md"
            options={[
              { value: 'percent', label: 'Percentage (%)' },
              { value: 'flat', label: 'Flat amount (₹)' },
            ]}
            value={form.discountType}
            onChange={text('discountType')}
          />
        </FormField>
        <FormField label={form.discountType === 'percent' ? 'Percent off' : 'Amount off (₹)'} htmlFor="offer-value">
          <NumberInput id="offer-value" min="1" max={form.discountType === 'percent' ? 100 : undefined} value={form.value} onChange={set('value')} required />
        </FormField>
        {form.discountType === 'percent' && (
          <FormField label="Max discount (₹)" htmlFor="offer-max">
            <NumberInput id="offer-max" min="1" value={form.maxDiscount} onChange={set('maxDiscount')} placeholder="No cap" />
          </FormField>
        )}
        <FormField label="Minimum order (₹)" htmlFor="offer-min">
          <NumberInput id="offer-min" min="0" value={form.minOrder} onChange={set('minOrder')} />
        </FormField>
        <FormField label="Only first N orders" htmlFor="offer-first">
          <NumberInput id="offer-first" min="1" value={form.validForFirstNOrders} onChange={set('validForFirstNOrders')} placeholder="Any order" />
        </FormField>
        <FormField label="Starts" htmlFor="offer-start">
          <Input id="offer-start" type="datetime-local" className="h-10 bg-surface" value={form.startsAt} onChange={text('startsAt')} />
        </FormField>
        <FormField label="Ends" htmlFor="offer-end">
          <Input id="offer-end" type="datetime-local" className="h-10 bg-surface" value={form.endsAt} onChange={text('endsAt')} />
        </FormField>
      </div>
      <FormField label="Banner image" htmlFor="offer-image">
        <ImageField id="offer-image" value={form.imageUrl} onChange={set('imageUrl')} />
      </FormField>
      <div className="space-y-space-sm rounded-xl bg-surface-container-low p-space-md">
        <CheckboxRow label="Active" description="Customers can apply this code." checked={form.isActive} onChange={set('isActive')} />
        <CheckboxRow label="Featured" description="Highlighted on the app’s offers screen." checked={form.isFeatured} onChange={set('isFeatured')} />
      </div>
    </FormSheet>
  )
}

export function OffersPage() {
  const { list, save, remove } = useOffers()
  const [editing, setEditing] = useState(null)

  const close = () => {
    save.reset()
    remove.reset()
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Offers & Coupons"
        description="Create discount codes, set thresholds and expiry, and track how often they’re used."
        actions={
          <Button variant="primary" onClick={() => setEditing({})}>
            <Plus /> New Offer
          </Button>
        }
      />

      <QueryState query={list}>
        {(offers) =>
          offers.length === 0 ? (
            <Card className="p-space-xl">
              <EmptyState icon={Tag} title="No offers yet">
                Create a coupon like APNA50 to reward customers.
              </EmptyState>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 2xl:grid-cols-3">
              {offers.map((o) => (
                <Card key={o.id} className={cn('flex flex-col overflow-hidden', !o.isActive && 'opacity-70')}>
                  <div className="flex items-start justify-between gap-space-md bg-brand-gradient p-space-lg text-on-primary">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-label-md font-bold tracking-wider backdrop-blur-sm">
                        <Tag className="size-3.5" aria-hidden="true" /> {o.code}
                      </span>
                      <p className="mt-space-sm font-display text-headline-lg">{discountLabel(o)}</p>
                    </div>
                    {o.isFeatured && (
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-label-sm">
                        <Star className="size-3 fill-current" aria-hidden="true" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-space-sm p-space-lg">
                    <h2 className="text-headline-sm text-on-surface">{o.title}</h2>
                    <p className="text-body-md text-on-surface-variant">{o.subtitle}</p>
                    <ul className="mt-auto space-y-1 pt-space-sm text-body-sm text-on-surface-variant">
                      <li>
                        Min order {formatINR(o.minOrder, { decimals: false })}
                        {o.maxDiscount ? ` · max ${formatINR(o.maxDiscount, { decimals: false })} off` : ''}
                        {o.validForFirstNOrders ? ` · first ${o.validForFirstNOrders} orders` : ''}
                      </li>
                      {(o.startsAt || o.endsAt) && (
                        <li className="flex items-center gap-1">
                          <CalendarRange className="size-3.5" aria-hidden="true" />
                          {o.startsAt ? formatDate(o.startsAt) : 'Now'} → {o.endsAt ? formatDate(o.endsAt) : 'no end date'}
                        </li>
                      )}
                      <li className="flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden="true" /> Used {o.timesUsed} {o.timesUsed === 1 ? 'time' : 'times'}
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between gap-space-sm bg-surface-container-low p-space-md">
                    <label className="flex items-center gap-space-sm text-label-md text-on-surface">
                      <Switch
                        checked={o.isActive}
                        onCheckedChange={(isActive) => save.mutateAsync({ id: o.id, isActive }).catch((e) => window.alert(e.message))}
                      />
                      {o.isActive ? 'Active' : 'Paused'}
                    </label>
                    <Button variant="outline" size="sm" className="shadow-none" onClick={() => setEditing(o)}>
                      <Pencil /> Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        }
      </QueryState>

      {editing && <OfferForm key={editing.id ?? 'new'} offer={editing.id ? editing : null} save={save} remove={remove} onDone={close} />}
    </div>
  )
}
