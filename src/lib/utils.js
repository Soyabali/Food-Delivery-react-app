import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge must know our custom tokens. Without the type scale it treats
// `text-label-md` (a size) and `text-primary` (a colour) as conflicting; without
// the spacing scale `pl-9` can't override `pl-space-md`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['space-xs', 'space-sm', 'space-md', 'space-lg', 'space-xl', 'gutter', 'gutter-dense', 'margin', 'margin-mobile', 'sidebar'],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'headline-xl',
            'headline-lg',
            'headline-md',
            'headline-sm',
            'metric-display',
            'body-lg',
            'body-md',
            'body-sm',
            'label-lg',
            'label-md',
            'label-sm',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const inrWholeFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** Indian rupee with Indian digit grouping, e.g. ₹1,42,850.00 */
export function formatINR(value, { decimals = true } = {}) {
  return `₹${(decimals ? inrFormatter : inrWholeFormatter).format(value)}`
}

/** Compact rupee for chart labels, e.g. ₹16.4k */
export function formatINRCompact(value) {
  return value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${value}`
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
