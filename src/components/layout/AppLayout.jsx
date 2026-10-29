import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useStats } from '@/hooks/queries'
import { SidebarContent } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: stats } = useStats()
  const badges = { activeOrders: stats?.activeOrders }

  return (
    <div className="min-h-dvh bg-surface">
      {/* Desktop: fixed rail */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-sidebar bg-surface-container-lowest shadow-bar lg:block">
        <SidebarContent badges={badges} />
      </aside>

      {/* Mobile & tablet: slide-out drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" aria-describedby={undefined} className="lg:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent badges={badges} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-sidebar">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-space-lg py-space-xl sm:px-space-xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
