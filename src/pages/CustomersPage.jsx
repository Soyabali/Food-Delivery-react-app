import { Search, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { useAuth } from '@/auth/authContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IconInput, Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { UserAvatar } from '@/components/layout/Sidebar'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormField, PasswordInput } from '@/components/shared/Form'
import { FormSheet } from '@/components/shared/FormSheet'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { QueryState } from '@/components/shared/QueryState'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { useSaveUser, useUsers } from '@/hooks/queries'
import { formatDate, timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20
const roleOptions = [
  { value: '', label: 'Everyone' },
  { value: 'customer', label: 'Customers' },
  { value: 'admin', label: 'Admins' },
]

function NewUserSheet({ save, onDone }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'customer' })
  const text = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onDone()}
      title="Add a user"
      description="Create a customer or another admin account."
      onSubmit={() => save.mutateAsync({ ...form, phone: form.phone || null }).then(onDone, () => {})}
      submitLabel="Create user"
      pending={save.isPending}
      error={save.error}
    >
      <FormField label="Full name" htmlFor="user-name">
        <Input id="user-name" className="h-10 bg-surface" minLength={2} value={form.fullName} onChange={text('fullName')} required autoFocus />
      </FormField>
      <FormField label="Email" htmlFor="user-email">
        <Input id="user-email" type="email" className="h-10 bg-surface" value={form.email} onChange={text('email')} required />
      </FormField>
      <FormField label="Phone" htmlFor="user-phone">
        <Input id="user-phone" type="tel" className="h-10 bg-surface" value={form.phone} onChange={text('phone')} />
      </FormField>
      <FormField label="Temporary password" htmlFor="user-password" hint="At least 8 characters. They can change it later.">
        <PasswordInput id="user-password" autoComplete="new-password" minLength={8} value={form.password} onChange={text('password')} required />
      </FormField>
      <FormField label="Role" htmlFor="user-role">
        <NativeSelect
          id="user-role"
          selectClassName="h-10 bg-surface font-normal text-body-md"
          options={roleOptions.slice(1).map((o) => ({ ...o, label: o.label.slice(0, -1) }))}
          value={form.role}
          onChange={text('role')}
        />
      </FormField>
    </FormSheet>
  )
}

export function CustomersPage() {
  const { user: me } = useAuth()
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [adding, setAdding] = useState(false)
  const deferredQ = useDeferredValue(q.trim())
  const users = useUsers({ q: deferredQ || undefined, role: role || undefined, page, pageSize: PAGE_SIZE })
  const save = useSaveUser()
  const [pendingId, setPendingId] = useState(null)

  async function update(user, changes, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return
    setPendingId(user.id)
    try {
      await save.mutateAsync({ id: user.id, ...changes })
    } catch (error) {
      window.alert(error.message)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Customers & Team"
        description="Everyone with an Apna Food account. Grant the Admin role to give someone dashboard access."
        actions={
          <Button variant="primary" onClick={() => setAdding(true)}>
            <UserPlus /> Add User
          </Button>
        }
      />

      <Card className="flex flex-col gap-space-md p-space-md md:flex-row md:items-center md:justify-between">
        <IconInput
          icon={Search}
          className="flex-1 md:max-w-md"
          inputClassName="h-10"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
          placeholder="Search name, email or phone…"
          aria-label="Search users"
        />
        <SegmentedControl
          label="Role"
          options={roleOptions}
          value={role}
          onChange={(value) => {
            setRole(value)
            setPage(1)
          }}
          itemClassName="px-space-md py-1.5 text-label-md"
        />
      </Card>

      <QueryState query={users}>
        {({ items, total }) =>
          items.length === 0 ? (
            <Card className="p-space-xl">
              <EmptyState icon={Users} title="No users found">
                Try a different search or role filter.
              </EmptyState>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="h-9 bg-surface-container-low text-label-sm tracking-wider text-on-surface-variant uppercase">
                      <th className="px-space-md">User</th>
                      <th className="px-space-md">Phone</th>
                      <th className="px-space-md text-right">Orders</th>
                      <th className="px-space-md">Joined</th>
                      <th className="px-space-md">Last sign-in</th>
                      <th className="px-space-md">Role</th>
                      <th className="px-space-md text-center">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40 text-body-sm">
                    {items.map((u) => {
                      const isMe = String(u.id) === String(me?.id)
                      const busy = pendingId === u.id
                      return (
                        <tr key={u.id} className={cn('h-14 transition-colors hover:bg-surface-container-low', !u.isActive && 'opacity-60')}>
                          <td className="px-space-md">
                            <div className="flex items-center gap-space-sm">
                              <UserAvatar name={u.fullName} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 text-label-lg text-on-surface">
                                  {u.fullName}
                                  {u.role === 'admin' && <ShieldCheck className="size-4 text-primary" aria-label="Admin" />}
                                  {isMe && <span className="text-label-sm text-on-surface-variant">(you)</span>}
                                </div>
                                <div className="truncate text-on-surface-variant">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-space-md whitespace-nowrap text-on-surface-variant">{u.phone ?? '—'}</td>
                          <td className="tabular px-space-md text-right text-label-lg">{u.orderCount}</td>
                          <td className="px-space-md whitespace-nowrap text-on-surface-variant">{formatDate(u.createdAt)}</td>
                          <td className="px-space-md whitespace-nowrap text-on-surface-variant">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</td>
                          <td className="px-space-md">
                            <NativeSelect
                              className="w-32"
                              selectClassName={cn('h-8 text-label-md', u.role === 'admin' && 'bg-secondary-fixed text-primary')}
                              options={[
                                { value: 'customer', label: 'Customer' },
                                { value: 'admin', label: 'Admin' },
                              ]}
                              value={u.role}
                              disabled={busy || isMe}
                              title={isMe ? 'You can’t change your own role' : undefined}
                              onChange={(e) =>
                                update(
                                  u,
                                  { role: e.target.value },
                                  e.target.value === 'admin'
                                    ? `Give ${u.fullName} full access to this dashboard?`
                                    : `Remove dashboard access from ${u.fullName}?`,
                                )
                              }
                              aria-label={`${u.fullName} role`}
                            />
                          </td>
                          <td className="px-space-md text-center">
                            <Switch
                              checked={u.isActive}
                              disabled={busy || isMe}
                              onCheckedChange={(isActive) =>
                                update(u, { isActive }, isActive ? null : `Disable ${u.fullName}? They won’t be able to sign in.`)
                              }
                              aria-label={`${u.fullName} account active`}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-space-sm px-space-md py-space-sm text-body-sm text-on-surface-variant">
                <span>
                  {total} {total === 1 ? 'account' : 'accounts'}
                </span>
                {total > PAGE_SIZE && <Pagination page={page} pageCount={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />}
              </div>
            </Card>
          )
        }
      </QueryState>

      {adding && (
        <NewUserSheet
          save={save}
          onDone={() => {
            save.reset()
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
