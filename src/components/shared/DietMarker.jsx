import { cn } from '@/lib/utils'

// FSSAI dietary marker: green circle = veg, red square = non-veg.
const sizes = {
  sm: { frame: 'size-3.5 p-[2px]', dot: 'size-1.5' },
  md: { frame: 'size-4 p-[2px]', dot: 'size-2' },
  lg: { frame: 'size-5 p-[3px]', dot: 'size-2.5' },
}

export function DietMarker({ diet, size = 'md', className }) {
  const isVeg = diet === 'veg'
  const s = sizes[size]
  return (
    <span
      role="img"
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[3px] border',
        isVeg ? 'border-success bg-emerald-50' : 'border-tertiary bg-tertiary-fixed',
        s.frame,
        className,
      )}
    >
      <span className={cn(s.dot, isVeg ? 'rounded-full bg-success' : 'rounded-[1px] bg-tertiary')} />
    </span>
  )
}
