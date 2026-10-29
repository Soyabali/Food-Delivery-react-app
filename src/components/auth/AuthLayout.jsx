import { Store, TrendingUp, UtensilsCrossed } from 'lucide-react'

// Form helpers live in shared/Form so the admin forms can reuse them too.
export { FormAlert, FormField, PasswordInput } from '@/components/shared/Form'

const highlights = [
  { icon: TrendingUp, text: 'Live revenue, order throughput and kitchen telemetry' },
  { icon: Store, text: 'Manage restaurant partners, menus and offers' },
  { icon: UtensilsCrossed, text: 'Preview dishes exactly as customers see them' },
]

/** Split-screen shell for login, registration and password reset. */
export function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-on-primary lg:flex">
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/5" aria-hidden="true" />
        <div className="relative flex items-center gap-space-sm">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <UtensilsCrossed className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-headline-md">Apna Food</span>
          <span className="rounded-full bg-white/20 px-space-sm py-0.5 text-label-sm">ADMIN</span>
        </div>
        <div className="relative">
          <h2 className="font-display text-[40px] leading-[48px] font-bold tracking-tight">
            Run every kitchen, order and rider from one console.
          </h2>
          <ul className="mt-space-xl space-y-space-md">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-space-md text-body-lg text-white/90">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-body-sm text-white/70">Hyperlocal Logistics Engine · Bengaluru</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-space-lg py-space-xl sm:px-space-xl">
        <div className="w-full max-w-md">
          <div className="mb-space-xl flex items-center gap-space-sm lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-gradient text-on-primary">
              <UtensilsCrossed className="size-[18px]" aria-hidden="true" />
            </span>
            <span className="font-display text-headline-sm">Apna Food</span>
          </div>
          <h1 className="text-headline-lg text-on-surface sm:text-headline-xl">{title}</h1>
          {description && <p className="mt-1 text-body-lg text-on-surface-variant">{description}</p>}
          <div className="mt-space-xl">{children}</div>
          {footer && <div className="mt-space-xl text-center text-body-md text-on-surface-variant">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
