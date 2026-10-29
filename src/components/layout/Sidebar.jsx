import { LogOut, UtensilsCrossed } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import { navItems } from '@/data/navigation'
import { cn, getInitials } from '@/lib/utils'

export function BrandMark() {
  return (
    <div className="flex items-center gap-space-sm">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-gradient text-on-primary shadow-sm">
        <UtensilsCrossed className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="font-display text-headline-sm text-on-surface">Apna Food</span>
    </div>
  )
}

export function UserAvatar({ name, className }) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-label-md text-primary',
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name || '?')}
    </span>
  )
}

/**
 * Sidebar contents, shared by the fixed desktop rail and the mobile drawer.
 * `badges` maps a nav item's badgeKey to a count; `onNavigate` closes the drawer.
 */
export function SidebarContent({ badges = {}, onNavigate }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex min-h-0 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-space-sm px-space-lg">
          <BrandMark />
          <span className="rounded-full bg-secondary-fixed px-space-sm py-space-xs text-label-sm tracking-wide text-primary">
            ADMIN
          </span>
        </div>

        <nav aria-label="Main" className="no-scrollbar flex-1 space-y-space-xs overflow-y-auto px-space-md py-space-sm">
          {navItems.map(({ to, label, icon: Icon, end, badgeKey }) => {
            const badge = badgeKey ? badges[badgeKey] : null
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-space-md rounded-lg px-space-md py-space-sm text-label-lg transition-colors',
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
                  )
                }
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="rounded-full bg-secondary-container px-space-sm py-0.5 text-label-sm text-on-primary">
                    {badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="m-space-md flex items-center justify-between rounded-xl bg-surface-container-low p-space-md">
        <div className="flex min-w-0 items-center gap-space-sm">
          <UserAvatar name={user?.name} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-label-lg text-on-surface">{user?.name}</span>
            <span className="truncate text-body-sm text-on-surface-variant">{user?.email}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className="rounded-lg p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
        >
          <LogOut className="size-5" aria-hidden="true" />
          <span className="sr-only">Sign out</span>
        </button>
      </div>
    </div>
  )
}
