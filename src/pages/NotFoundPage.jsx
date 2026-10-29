import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'

export function NotFoundPage() {
  return (
    <Card className="p-space-xl">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        action={
          <Button asChild variant="solid">
            <Link to="/">Back to Overview</Link>
          </Button>
        }
      >
        The page you’re looking for doesn’t exist.
      </EmptyState>
    </Card>
  )
}
