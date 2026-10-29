import { CloudOff, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from './EmptyState'

/** Shimmer placeholder blocks (from the component sheet's skeleton spec). */
export function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-lg bg-surface-container ${className ?? ''}`} aria-hidden="true" />
}

export function LoadingCard({ label = 'Loading…', className = '' }) {
  return (
    <Card className={`flex items-center justify-center gap-space-sm p-space-xl text-body-md text-on-surface-variant ${className}`}>
      <Loader2 className="size-5 animate-spin text-primary-container" aria-hidden="true" />
      {label}
    </Card>
  )
}

export function ErrorCard({ error, onRetry, className = '' }) {
  return (
    <Card className={`p-space-xl ${className}`}>
      <EmptyState
        icon={CloudOff}
        title="Couldn’t load this data"
        action={
          onRetry && (
            <Button variant="solid" onClick={() => onRetry()}>
              <RefreshCw /> Try again
            </Button>
          )
        }
      >
        {error?.message ?? 'Something went wrong while talking to the API.'}
      </EmptyState>
    </Card>
  )
}

/**
 * Renders loading / error states for a TanStack query and hands the data to
 * `children` once it's ready.
 */
export function QueryState({ query, loading, children }) {
  if (query.isPending) return loading ?? <LoadingCard />
  if (query.isError) return <ErrorCard error={query.error} onRetry={query.refetch} />
  return children(query.data)
}
