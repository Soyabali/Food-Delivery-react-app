import { Bike, Info, Loader2, Megaphone, Send, Tag } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/select'
import { FormAlert, FormField } from '@/components/shared/Form'
import { PageHeader } from '@/components/shared/PageHeader'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { useSendNotification, useUsers } from '@/hooks/queries'
import { formatTime } from '@/lib/format'

const kinds = [
  { value: 'info', label: 'Info', icon: Info },
  { value: 'offer', label: 'Offer', icon: Tag },
  { value: 'delivery', label: 'Delivery', icon: Bike },
]

const emptyForm = { title: '', body: '', kind: 'info', userId: '' }

export function NotificationsPage() {
  const [form, setForm] = useState(emptyForm)
  const [sent, setSent] = useState([])
  const send = useSendNotification()
  const customers = useUsers({ role: 'customer', pageSize: 100 })
  const text = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const recipients = customers.data?.items ?? []

  async function handleSubmit(event) {
    event.preventDefault()
    const audience = form.userId ? recipients.find((u) => String(u.id) === form.userId)?.fullName : 'All customers'
    if (!form.userId && !window.confirm('Send this notification to every customer?')) return
    try {
      await send.mutateAsync({ title: form.title.trim(), body: form.body.trim(), kind: form.kind, userId: form.userId ? Number(form.userId) : null })
      setSent((list) => [{ ...form, audience, at: new Date().toISOString() }, ...list])
      setForm(emptyForm)
    } catch {
      // Shown from send.error.
    }
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader title="Notifications" description="Push announcements, offers and delivery alerts to customers’ in-app inbox." />

      <div className="grid grid-cols-1 items-start gap-space-xl xl:grid-cols-5">
        <Card as="form" onSubmit={handleSubmit} className="space-y-space-md p-space-lg xl:col-span-3">
          <h2 className="flex items-center gap-space-sm text-headline-md text-on-surface">
            <Megaphone className="size-5 text-primary" aria-hidden="true" /> Compose
          </h2>
          <FormAlert>{send.error?.message}</FormAlert>
          <FormField label="Type">
            <SegmentedControl
              label="Notification type"
              options={kinds}
              value={form.kind}
              onChange={(kind) => setForm((f) => ({ ...f, kind }))}
              itemClassName="px-space-md py-1.5 text-label-md"
            />
          </FormField>
          <FormField label="Title" htmlFor="notif-title">
            <Input id="notif-title" className="h-10 bg-surface" maxLength={120} value={form.title} onChange={text('title')} placeholder="Weekend biryani fest 🍛" required />
          </FormField>
          <FormField label="Message" htmlFor="notif-body" hint={`${form.body.length}/500`}>
            <textarea
              id="notif-body"
              rows={4}
              maxLength={500}
              className="w-full rounded-lg bg-surface px-space-md py-space-sm text-body-md focus:shadow-[0_0_0_3px_rgba(255,107,53,0.2)] focus:outline-none"
              value={form.body}
              onChange={text('body')}
              placeholder="Use code APNA50 for 50% off until Sunday midnight."
              required
            />
          </FormField>
          <FormField label="Send to" htmlFor="notif-user">
            <NativeSelect
              id="notif-user"
              selectClassName="h-10 bg-surface font-normal text-body-md"
              options={[{ value: '', label: 'All customers (broadcast)' }, ...recipients.map((u) => ({ value: String(u.id), label: `${u.fullName} — ${u.email}` }))]}
              value={form.userId}
              onChange={text('userId')}
            />
          </FormField>
          <div className="flex justify-end pt-space-sm">
            <Button type="submit" variant="primary" size="lg" disabled={send.isPending}>
              {send.isPending ? <Loader2 className="animate-spin" /> : <Send />}
              Send notification
            </Button>
          </div>
        </Card>

        <Card className="p-space-lg xl:col-span-2">
          <h2 className="mb-space-md text-headline-sm text-on-surface">Sent this session</h2>
          {sent.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">Notifications you send will be listed here.</p>
          ) : (
            <ul className="space-y-space-sm">
              {sent.map((n) => {
                const Icon = kinds.find((k) => k.value === n.kind).icon
                return (
                  <li key={n.at} className="rounded-lg bg-surface-container-low p-space-md">
                    <div className="flex items-center justify-between gap-space-sm">
                      <span className="flex items-center gap-space-xs text-label-lg text-on-surface">
                        <Icon className="size-4 text-primary" aria-hidden="true" /> {n.title}
                      </span>
                      <span className="tabular text-label-sm text-on-surface-variant">{formatTime(n.at)}</span>
                    </div>
                    <p className="mt-1 text-body-sm text-on-surface-variant">{n.body}</p>
                    <p className="mt-1 text-label-sm text-success">Delivered to {n.audience}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
