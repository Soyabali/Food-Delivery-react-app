import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { IconInput } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const dietOptions = [
  { value: 'all', label: 'All Diets' },
  { value: 'veg', label: 'Veg Only', dot: 'bg-success' },
  { value: 'nonveg', label: 'Non-Veg Only', dot: 'bg-tertiary' },
]

/** restaurants / categories: [{ value, label }] including an "All" option. */
export function MenuFilterBar({ filters, onChange, restaurants, categories }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })

  return (
    <Card className="flex flex-wrap items-center justify-between gap-space-md p-space-md">
      <div className="flex flex-wrap items-center gap-space-sm">
        <NativeSelect
          className="w-full sm:w-auto"
          selectClassName="h-8 rounded-full font-bold"
          options={restaurants}
          value={filters.restaurantId}
          onChange={(e) => set('restaurantId')(e.target.value)}
          aria-label="Filter by restaurant"
        />
        <NativeSelect
          selectClassName="h-8 rounded-full bg-surface-container text-label-md"
          options={categories}
          value={filters.categoryId}
          onChange={(e) => set('categoryId')(e.target.value)}
          aria-label="Filter by category"
        />
        <div role="radiogroup" aria-label="Dietary filter" className="flex rounded-full bg-surface-container-low p-0.5">
          {dietOptions.map((option) => {
            const active = filters.diet === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set('diet')(option.value)}
                className={cn(
                  'flex h-7 items-center gap-1 rounded-full px-space-md text-label-md transition-colors',
                  active ? 'bg-surface-container-lowest font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface',
                  active && option.value === 'nonveg' && 'text-tertiary',
                  active && option.value === 'veg' && 'text-success',
                )}
              >
                {option.dot && <span className={cn('size-2 rounded-full', option.dot)} />}
                {option.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          aria-pressed={filters.availableOnly}
          onClick={() => set('availableOnly')(!filters.availableOnly)}
          className={cn(
            'flex h-8 items-center gap-space-xs rounded-full px-space-md text-label-md transition-colors',
            filters.availableOnly ? 'bg-success-container text-success' : 'bg-surface-container-low text-on-surface hover:bg-surface-container',
          )}
        >
          <span className={cn('size-2 rounded-full', filters.availableOnly ? 'animate-pulse bg-emerald-500' : 'bg-surface-dim')} />
          Available Only
        </button>
      </div>
      <IconInput
        icon={Search}
        className="w-full sm:w-64"
        inputClassName="h-8 text-body-sm"
        value={filters.query}
        onChange={(e) => set('query')(e.target.value)}
        placeholder="Filter dishes by name or ID..."
        aria-label="Filter dishes by name or ID"
      />
    </Card>
  )
}
