import { CalendarDays, CircleAlert, CircleCheck, Filter, RefreshCw, Search, Soup, Tag as TagIcon, Zap } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconInput, Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DietMarker } from '@/components/shared/DietMarker'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Toast } from '@/components/shared/Toast'
import { cn, formatINR, getInitials } from '@/lib/utils'
import { SpecSection } from './SpecSection'

function Field({ label, hint, tone, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-space-xs">
      <label htmlFor={htmlFor} className={cn('text-label-md', tone === 'error' ? 'text-error' : tone === 'focus' ? 'text-primary' : 'text-on-surface')}>
        {label}
      </label>
      {children}
      <span className={cn('flex items-center gap-1 text-body-sm', tone === 'error' ? 'text-error' : tone === 'focus' ? 'text-primary' : 'text-on-surface-variant')}>
        {hint}
      </span>
    </div>
  )
}

export function FormControlsSection() {
  const [pin, setPin] = useState('5600')
  const [autoAccept, setAutoAccept] = useState(true)
  const [surcharge, setSurcharge] = useState(false)
  const [viewMode, setViewMode] = useState('feed')
  const pinInvalid = !/^\d{6}$/.test(pin)

  return (
    <SpecSection number={3} title="Form Controls & High-Density Inputs" meta="Standardized 44px Baseline" accent="bg-secondary">
      <div className="mb-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-2 2xl:grid-cols-4">
        <Field label="Customer Contact Number" hint="Default state (unfocused)" htmlFor="ds-phone">
          <Input id="ds-phone" type="tel" className="h-11" placeholder="+91 98450 00000" />
        </Field>
        <Field label="Delivery Address Landmark" hint="Filled valid state" htmlFor="ds-landmark">
          <div className="relative">
            <Input id="ds-landmark" className="h-11 bg-surface-container-lowest pr-10 shadow-sm" defaultValue="Opp. Sony World Signal, Koramangala" />
            <CircleCheck className="absolute top-1/2 right-space-md size-[18px] -translate-y-1/2 text-emerald-600" aria-hidden="true" />
          </div>
        </Field>
        <Field label="Special Cooking Instructions" hint="Active focus state with 3px amber halo" tone="focus" htmlFor="ds-notes">
          <Input id="ds-notes" className="h-11 bg-surface-container-lowest shadow-[0_0_0_3px_rgba(255,107,53,0.2)]" defaultValue="Less spicy, extra green chutney" />
        </Field>
        <Field
          label="Delivery PIN Code"
          hint={pinInvalid ? 'Invalid PIN Code. 6 digits required.' : 'Looks good.'}
          tone={pinInvalid ? 'error' : undefined}
          htmlFor="ds-pin"
        >
          <div className="relative">
            <Input
              id="ds-pin"
              inputMode="numeric"
              className="h-11 pr-10"
              invalid={pinInvalid}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            {pinInvalid && <CircleAlert className="absolute top-1/2 right-space-md size-[18px] -translate-y-1/2 text-error" aria-hidden="true" />}
          </div>
        </Field>
      </div>

      <div className="mb-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-3">
        <Field label="Assigned Kitchen Zone" htmlFor="ds-zone">
          <NativeSelect
            id="ds-zone"
            selectClassName="h-11 font-normal text-body-md"
            options={['Indiranagar Main Cloud Kitchen (Zone A)', 'HSR Layout Outpost (Zone B)', 'Whitefield Fulfillment Hub (Zone C)']}
          />
        </Field>
        <Field label="Global Dispatch Search" htmlFor="ds-search">
          <IconInput
            id="ds-search"
            icon={Search}
            inputClassName="h-11"
            placeholder="Search order ID, rider, or dish..."
            trailing={<kbd className="rounded bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant shadow-sm">⌘K</kbd>}
          />
        </Field>
        <Field label="Reporting Settlement Window" htmlFor="ds-dates">
          <IconInput id="ds-dates" icon={CalendarDays} inputClassName="h-11" defaultValue="Oct 24, 2024 - Oct 31, 2024" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-space-lg rounded-xl bg-surface-container-low p-space-lg md:grid-cols-3">
        <div className="flex flex-col gap-space-sm">
          <span className="text-label-lg text-on-surface">Kitchen Availability Toggles</span>
          {[
            ['Auto-Accept Pre-orders', autoAccept, setAutoAccept],
            ['Peak Surcharge Override', surcharge, setSurcharge],
          ].map(([label, checked, setChecked]) => (
            <label key={label} className="flex cursor-pointer items-center justify-between rounded-lg bg-surface-container-lowest px-space-md py-space-sm shadow-sm">
              <span className="text-body-md text-on-surface">{label}</span>
              <Switch size="lg" checked={checked} onCheckedChange={setChecked} />
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-space-sm">
          <span className="text-label-lg text-on-surface">Dispatch View Mode (Segmented)</span>
          <SegmentedControl
            label="Dispatch view mode"
            className="w-full rounded-xl"
            itemClassName="rounded-lg py-1.5 text-label-md"
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'feed', label: 'Live Feed' },
              { value: 'map', label: 'Rider Map' },
              { value: 'sla', label: 'SLA Queue' },
            ]}
          />
          <span className="text-body-sm text-on-surface-variant">Switch active fleet view without reload</span>
        </div>
        <div className="flex flex-col gap-space-sm">
          <span className="text-label-lg text-on-surface">Selection Primitives</span>
          <div className="flex flex-wrap items-center gap-x-space-xl gap-y-space-sm pt-space-xs text-body-md text-on-surface">
            <label className="flex cursor-pointer items-center gap-space-sm">
              <input type="checkbox" defaultChecked className="size-4 accent-primary-container" /> Surge Active
            </label>
            <label className="flex cursor-pointer items-center gap-space-sm">
              <input type="radio" name="ds-rider" defaultChecked className="size-4 accent-primary-container" /> Express Rider
            </label>
            <label className="flex cursor-pointer items-center gap-space-sm">
              <input type="radio" name="ds-rider" className="size-4 accent-primary-container" /> Pool
            </label>
          </div>
        </div>
      </div>
    </SpecSection>
  )
}

export function BadgesSection() {
  return (
    <SpecSection number={4} title="Status Badges, Dynamic Chips & Offer Tickets" meta="Micro-States & Tokens" accent="bg-emerald-600">
      <div className="mb-space-xl grid grid-cols-2 gap-space-md md:grid-cols-5">
        {[
          ['placed', 'Placed', 'Order Placed'],
          ['preparing', 'Preparing', 'In Kitchen (9m)'],
          ['out_for_delivery', 'Out For Delivery', 'Rider Dispatched'],
          ['delivered', 'Delivered', 'Delivered'],
          ['cancelled', 'Cancelled', 'Rejected / Void'],
        ].map(([status, caption, label]) => (
          <div key={status} className="flex flex-col items-start gap-space-sm rounded-lg bg-surface-container-low p-space-md">
            <span className="text-label-sm text-on-surface-variant uppercase">{caption}</span>
            <StatusBadge status={status} label={label} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-space-lg rounded-xl bg-surface-container-low p-space-lg">
        <div className="flex flex-wrap items-center gap-space-md">
          <span className="text-label-md text-on-surface">Store Ratings:</span>
          <span className="flex h-6 items-center gap-1 rounded-full bg-emerald-600 px-2 text-label-md text-on-primary">★ 4.8</span>
          <span className="flex h-6 items-center gap-1 rounded-full bg-emerald-700 px-2 text-label-md text-on-primary">★ 4.9 Super Chef</span>
        </div>
        <span className="hidden h-6 w-px bg-surface-variant md:block" />
        <div className="flex flex-wrap items-center gap-space-md">
          <span className="text-label-md text-on-surface">Marketing Coupon Chips:</span>
          <span className="flex h-7 items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 text-label-md text-primary shadow-sm">
            <TagIcon className="size-4" aria-hidden="true" />
            <span className="font-bold tracking-wider">APNA50</span>
            <span className="text-on-surface-variant">(50% Flat)</span>
          </span>
          <span className="flex h-7 items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 text-label-md text-tertiary shadow-sm">
            <Zap className="size-4" aria-hidden="true" />
            <span className="font-bold tracking-wider">BIRIYANIFAST</span>
          </span>
        </div>
      </div>
    </SpecSection>
  )
}

const dispatchRows = [
  { id: 'AF-89234', ago: '2 mins ago • Koramangala', kitchen: 'Meghana Foods', items: 'Boneless Special x 2', diet: 'nonveg', status: 'preparing', rider: 'Ramesh K. (EV-12)', value: 640, action: 'Reassign' },
  { id: 'AF-89233', ago: '8 mins ago • Indiranagar', kitchen: 'MTR 1924', items: 'Rava Idli Meal, Filter Coffee', diet: 'veg', status: 'out_for_delivery', rider: 'Sunil N. (Swift)', value: 295, action: 'Track Live' },
  { id: 'AF-89230', ago: '14 mins ago • HSR Layout', kitchen: 'Empire Restaurant', items: 'Coin Parotta x 6, Ghee Roast', diet: 'nonveg', status: 'delivered', rider: 'Mohammed D. (EV-04)', value: 820, action: 'Receipt' },
]

export function DataTableSection() {
  const [page, setPage] = useState(1)
  return (
    <SpecSection
      number={5}
      title="Mission-Critical Dispatch Data Table"
      meta={
        <span className="flex items-center gap-space-sm">
          Auto-refresh: 15s
          <span className="flex h-8 items-center gap-1 rounded-lg bg-surface-container-low px-space-md text-label-sm text-on-surface">
            <Filter className="size-4" aria-hidden="true" /> Filter Queue
          </span>
        </span>
      }
    >
      <div className="relative overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-surface-container text-label-sm tracking-wider text-on-surface-variant uppercase">
            <tr className="h-10">
              <th className="px-space-md">Order ID</th>
              <th className="px-space-md">Kitchen / Outlet</th>
              <th className="px-space-md">Dietary</th>
              <th className="px-space-md">Status</th>
              <th className="px-space-md">Rider Assigned</th>
              <th className="px-space-md text-right">Value (₹)</th>
              <th className="px-space-md text-center">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {dispatchRows.map((row) => (
              <tr key={row.id} className="h-14 transition-colors hover:bg-surface-container-low">
                <td className="px-space-md py-space-sm">
                  <span className="block text-label-lg text-on-surface">#{row.id}</span>
                  <span className="text-body-sm text-on-surface-variant">{row.ago}</span>
                </td>
                <td className="px-space-md py-space-sm">
                  <span className="block text-label-md text-on-surface">{row.kitchen}</span>
                  <span className="text-body-sm text-on-surface-variant">{row.items}</span>
                </td>
                <td className="px-space-md py-space-sm">
                  <DietMarker diet={row.diet} />
                </td>
                <td className="px-space-md py-space-sm">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-space-md py-space-sm">
                  <span className="flex items-center gap-space-xs">
                    <span className="flex size-6 items-center justify-center rounded-full bg-surface-container text-label-sm">{getInitials(row.rider)}</span>
                    {row.rider}
                  </span>
                </td>
                <td className="tabular px-space-md py-space-sm text-right text-label-lg">{formatINR(row.value)}</td>
                <td className="px-space-md py-space-sm text-center">
                  <span className={cn('inline-flex h-8 items-center rounded-lg bg-surface-container-low px-space-md text-label-md', row.status === 'delivered' ? 'text-on-surface-variant' : 'text-primary')}>
                    {row.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-space-lg flex flex-col justify-between gap-space-md pt-space-md sm:flex-row sm:items-center">
        <span className="text-body-sm text-on-surface-variant">Showing 1 to 3 of 418 Live Bengaluru Dispatches</span>
        <Pagination page={page} pageCount={42} onPageChange={setPage} />
      </div>
    </SpecSection>
  )
}

export function FeedbackSections() {
  return (
    <div className="grid grid-cols-1 gap-space-xl xl:grid-cols-2">
      <SpecSection number={6} title="Zero Data / Empty State Spec" accent="bg-secondary-container" className="flex flex-col justify-between">
        <EmptyState
          icon={Soup}
          title="No Active Orders Found"
          action={
            <Button variant="solid" size="lg" className="h-10 px-space-xl" tabIndex={-1}>
              <RefreshCw /> Refresh Search Pipeline
            </Button>
          }
        >
          There are currently no open kitchen tickets matching your live cluster filters. Orders will stream here automatically.
        </EmptyState>
        <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-md text-label-sm text-on-surface-variant">
          <span>Component: &lt;EmptyState /&gt;</span>
          <span>Variants: Orders, Deliveries, Riders</span>
        </div>
      </SpecSection>

      <SpecSection number={7} title="System Toast & Notification Feedback" accent="bg-tertiary" className="flex flex-col justify-between">
        <p className="mb-space-xl text-body-md text-on-surface-variant">
          Ephemeral notifications rendered in the operator HUD. Dark background elevation with high contrast undo actions.
        </p>
        <div className="space-y-space-md">
          <Toast
            title="Order #AF-45666 marked Delivered"
            description="Handed over to Customer at Koramangala 4th Block"
            action={<span className="rounded bg-white/10 px-space-md py-1 text-label-md text-primary-fixed-dim">Undo</span>}
          />
          <Toast
            tone="warning"
            title="Zone B SLA Risk: Indiranagar"
            description="Prep times exceed 24 mins. 12 orders queued."
            action={<span className="rounded bg-white/10 px-space-md py-1 text-label-md">View Zone</span>}
          />
        </div>
        <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-md text-label-sm text-on-surface-variant">
          <span>Toast Stack Container: Bottom-Right (Z-Index 100)</span>
          <span>Timeout: 5000ms Auto-Dismiss</span>
        </div>
      </SpecSection>
    </div>
  )
}

function SkeletonBar({ className }) {
  return <div className={cn('rounded bg-surface-variant', className)} />
}

export function SkeletonSection() {
  return (
    <SpecSection number={8} title="Shimmer Loading Skeletons" meta="Reduced Cumulative Layout Shift (CLS)" accent="bg-outline">
      <div className="mb-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-3" aria-hidden="true">
        {['w-4/5', 'w-3/4', 'w-2/3'].map((tail) => (
          <div key={tail} className="flex animate-pulse flex-col gap-space-md rounded-xl bg-surface-container-low p-space-lg">
            <div className="flex items-center justify-between">
              <SkeletonBar className="h-4 w-28" />
              <SkeletonBar className="h-5 w-14 rounded-full" />
            </div>
            <SkeletonBar className="mt-1 h-8 w-32" />
            <div className="mt-2 space-y-2">
              <SkeletonBar className="h-3 w-full opacity-70" />
              <SkeletonBar className={cn('h-3 opacity-70', tail)} />
            </div>
          </div>
        ))}
      </div>
      <div className="animate-pulse space-y-space-md rounded-xl bg-surface-container-low p-space-lg" aria-hidden="true">
        <SkeletonBar className="mb-space-md h-4 w-48" />
        {[1, 2].map((row) => (
          <div key={row} className="flex items-center justify-between gap-space-md">
            <SkeletonBar className="h-8 w-24" />
            <SkeletonBar className="h-8 w-48" />
            <SkeletonBar className="hidden h-8 w-20 sm:block" />
            <SkeletonBar className="hidden h-8 w-32 md:block" />
            <SkeletonBar className="h-8 w-16" />
          </div>
        ))}
      </div>
    </SpecSection>
  )
}
