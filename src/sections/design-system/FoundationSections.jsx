import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DietMarker } from '@/components/shared/DietMarker'
import { cn } from '@/lib/utils'
import { SpecSection } from './SpecSection'

const swatches = [
  { name: 'primary-container', hex: '#FF6B35', className: 'bg-primary-container' },
  { name: 'primary', hex: '#AB3500', className: 'bg-primary' },
  { name: 'primary-fixed', hex: '#FFDBD0', className: 'bg-primary-fixed' },
  { name: 'tertiary', hex: '#BD092E', className: 'bg-tertiary' },
  { name: 'success', hex: '#006D37', className: 'bg-success' },
  { name: 'surface-container', hex: '#E6EEFF', className: 'bg-surface-container' },
  { name: 'on-surface / text', hex: '#121C2A', className: 'bg-on-surface' },
]

const typeScale = [
  { token: 'headline-xl', sample: 'Bengaluru Operations Hub', className: 'font-display text-headline-xl' },
  { token: 'headline-lg', sample: '#AF-45666', className: 'font-display text-headline-lg' },
  { token: 'headline-md', sample: 'Live Orders Stream', className: 'font-display text-headline-md' },
  { token: 'headline-sm', sample: 'Active Dishes', className: 'font-display text-headline-sm' },
  { token: 'body-md', sample: 'Monitor live order queues and kitchen prep times.', className: 'text-body-md' },
  { token: 'label-lg', sample: 'Confirm Order', className: 'text-label-lg' },
  { token: 'label-sm', sample: 'REVENUE TODAY', className: 'text-label-sm tracking-wider' },
]

export function TokensSection() {
  return (
    <SpecSection number={1} title="Brand Tokens & Color Architecture" meta="Material 3 Precision Mappings">
      <div className="mb-space-lg rounded-lg bg-surface-container-low p-space-lg">
        <div className="mb-space-sm flex flex-wrap items-center justify-between gap-space-sm">
          <span className="text-label-lg text-on-surface">Primary Kinetic Action Gradient</span>
          <code className="text-body-sm break-all text-on-surface-variant">linear-gradient(90deg, #FF6B35 0%, #DE2B41 60%, #B9052C 100%)</code>
        </div>
        <div className="flex h-10 items-center justify-between rounded-lg bg-brand-gradient px-space-md text-label-sm text-on-primary shadow-sm">
          <span>0% Primary Warmth</span>
          <span className="hidden sm:inline">60% Transit Surge</span>
          <span>100% SLA Critical</span>
        </div>
      </div>

      <div className="mb-space-lg grid grid-cols-2 gap-space-md md:grid-cols-4 2xl:grid-cols-7">
        {swatches.map((s) => (
          <div key={s.name} className="flex flex-col gap-space-xs rounded-lg bg-surface-container-low p-space-md">
            <div className={cn('h-12 w-full rounded shadow-inner', s.className)} />
            <span className="truncate text-label-lg text-on-surface">{s.name}</span>
            <span className="text-label-sm text-on-surface-variant">{s.hex}</span>
          </div>
        ))}
      </div>

      <div className="mb-space-lg rounded-lg bg-surface-container-low p-space-lg">
        <h3 className="mb-space-md text-headline-sm text-on-surface">Type Scale — Plus Jakarta Sans &amp; Inter</h3>
        <dl className="space-y-space-sm">
          {typeScale.map((t) => (
            <div key={t.token} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-space-lg">
              <dt className="w-32 shrink-0 text-label-md text-on-surface-variant">{t.token}</dt>
              <dd className={cn('min-w-0 truncate text-on-surface', t.className)}>{t.sample}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col items-start justify-between gap-space-lg rounded-lg bg-surface-container-low p-space-lg md:flex-row md:items-center">
        <div>
          <h3 className="text-headline-sm text-on-surface">FSSAI Compliant Food Dietary Markers</h3>
          <p className="text-body-sm text-on-surface-variant">Mandatory regulatory food status symbols for items, menus, and cart summaries.</p>
        </div>
        <div className="flex flex-wrap items-center gap-space-md">
          {[
            ['veg', 'Pure Veg', 'Circle dot / 20px frame'],
            ['nonveg', 'Non-Veg', 'Square dot / 20px frame'],
          ].map(([diet, label, spec]) => (
            <div key={diet} className="flex items-center gap-space-md rounded-lg bg-surface-container-lowest px-space-lg py-space-sm shadow-sm">
              <DietMarker diet={diet} size="lg" />
              <div>
                <span className="block text-label-lg text-on-surface">{label}</span>
                <span className="text-label-sm text-on-surface-variant">{spec}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SpecSection>
  )
}

const buttonRows = [
  { name: 'Primary Brand', variant: 'primary', label: 'Confirm Order', loading: 'Saving…' },
  { name: 'Secondary Tinted', variant: 'tinted', label: 'View Routing', loading: 'Locating…' },
  { name: 'Destructive', variant: 'destructive', label: 'Cancel Dispatch', loading: 'Cancelling…' },
  { name: 'Ghost / Text', variant: 'ghost', label: 'Print Kitchen Ticket', loading: 'Spooling…' },
]

// Hover / pressed columns are frozen snapshots of the interactive states.
const stateClasses = {
  default: '',
  hovered: 'brightness-105 bg-surface-container shadow-md',
  pressed: 'scale-[0.98] brightness-95',
}

export function ButtonMatrix() {
  return (
    <SpecSection number={2} title="Comprehensive Button Matrix" meta="5 Canonical Interactive States" accent="bg-tertiary">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="h-9 bg-surface-container text-label-sm tracking-wider text-on-surface-variant uppercase">
              {['Variant', 'Default', 'Hovered', 'Pressed', 'Disabled (60%)', 'Loading State'].map((h, i, arr) => (
                <th key={h} className={cn('px-space-md', i === 0 && 'rounded-l-lg', i === arr.length - 1 && 'rounded-r-lg')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {buttonRows.map((row) => (
              <tr key={row.name} className="transition-colors hover:bg-surface-container-low">
                <td className="px-space-md py-space-lg text-label-lg text-on-surface">{row.name}</td>
                {Object.entries(stateClasses).map(([state, extra]) => (
                  <td key={state} className="px-space-md py-space-lg">
                    <Button
                      variant={row.variant}
                      size="lg"
                      tabIndex={-1}
                      className={cn('pointer-events-none', row.variant === 'primary' && state === 'hovered' ? 'brightness-105 shadow-md' : extra)}
                    >
                      {row.label}
                    </Button>
                  </td>
                ))}
                <td className="px-space-md py-space-lg">
                  <Button variant={row.variant} size="lg" disabled>
                    {row.label}
                  </Button>
                </td>
                <td className="px-space-md py-space-lg">
                  <Button variant={row.variant === 'destructive' ? 'deep' : row.variant} size="lg" className="pointer-events-none" tabIndex={-1}>
                    <Loader2 className="animate-spin" /> {row.loading}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SpecSection>
  )
}
