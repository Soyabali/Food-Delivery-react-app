import { Bell, ChevronRight, Menu, Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import { IconInput } from '@/components/ui/input'
import { navItems } from '@/data/navigation'
import { useStats } from '@/hooks/queries'
import { cn } from '@/lib/utils'
import { UserAvatar } from './Sidebar'

function useCurrentSection() {
  const { pathname } = useLocation()
  const match = navItems.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))
  return match?.label ?? 'Operations'
}

/** Green while /admin/stats keeps answering, red if the API is unreachable. */
function ApiStatus() {
  const { isError, isSuccess } = useStats()
  const online = isSuccess && !isError
  return (
    <div className="hidden items-center gap-space-xs rounded-full bg-surface-container px-space-md py-1 sm:flex" role="status">
      <span className={cn('size-2 rounded-full', online ? 'animate-pulse bg-emerald-500' : 'bg-tertiary')} aria-hidden="true" />
      <span className="text-label-md text-on-surface">{online ? 'Live data' : isError ? 'API offline' : 'Connecting…'}</span>
    </div>
  )
}

export function Topbar({ onOpenMenu }) {
  const section = useCurrentSection()
  const { user } = useAuth()
  const navigate = useNavigate()
  const searchRef = useRef(null)

  // ⌘K / Ctrl+K focuses the global search, as the shortcut hint promises.
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleSearch(event) {
    event.preventDefault()
    const term = searchRef.current.value.trim()
    if (term) navigate(`/orders?q=${encodeURIComponent(term)}`)
  }

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/90 shadow-bar backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-space-md px-space-lg sm:px-space-xl">
        <div className="flex min-w-0 items-center gap-space-sm">
          <button
            type="button"
            onClick={onOpenMenu}
            className="-ml-space-sm rounded-lg p-space-sm text-on-surface hover:bg-surface-container-low lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-space-sm text-label-md text-on-surface-variant">
            <span className="hidden sm:inline">Console</span>
            <ChevronRight className="hidden size-3.5 sm:block" aria-hidden="true" />
            <span className="truncate text-label-lg text-on-surface">{section}</span>
          </nav>
        </div>

        <form role="search" onSubmit={handleSearch} className="hidden max-w-md flex-1 md:block">
          <IconInput
            ref={searchRef}
            icon={Search}
            inputClassName="bg-surface text-body-sm"
            placeholder="Search orders by number or customer…"
            aria-label="Search orders by number or customer"
            trailing={
              <kbd className="rounded bg-surface-container px-1.5 py-0.5 text-label-sm text-on-surface-variant">⌘K</kbd>
            }
          />
        </form>

        <div className="flex shrink-0 items-center gap-space-sm sm:gap-space-lg">
          <ApiStatus />
          <Link
            to="/notifications"
            className="relative rounded-lg p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Send notifications"
          >
            <Bell className="size-[22px]" strokeWidth={1.75} />
          </Link>
          <Link to="/settings" title={`${user?.name} — account settings`}>
            <UserAvatar name={user?.name} />
          </Link>
        </div>
      </div>
    </header>
  )
}
