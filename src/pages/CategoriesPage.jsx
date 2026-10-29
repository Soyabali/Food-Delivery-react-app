import { Pencil, Plus, Shapes } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { EmptyState } from '@/components/shared/EmptyState'
import { CheckboxRow, FormField, NumberInput } from '@/components/shared/Form'
import { FormSheet } from '@/components/shared/FormSheet'
import { ImageField } from '@/components/shared/ImageField'
import { PageHeader } from '@/components/shared/PageHeader'
import { QueryState } from '@/components/shared/QueryState'
import { useCategories } from '@/hooks/queries'
import { slugify } from '@/lib/format'

const emptyCategory = { name: '', slug: '', emoji: '', imageUrl: null, sortOrder: 0, isActive: true }

function CategoryForm({ category, save, remove, onDone }) {
  const [form, setForm] = useState(() => ({ ...emptyCategory, ...category, emoji: category?.emoji ?? '' }))
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = () =>
    save
      .mutateAsync({
        id: category?.id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        emoji: form.emoji.trim() || null,
        imageUrl: form.imageUrl || null,
        sortOrder: form.sortOrder ?? 0,
        isActive: form.isActive,
      })
      .then(onDone, () => {})

  const handleDelete = () => {
    if (!window.confirm(`Delete the “${category.name}” category? Its dishes become uncategorised.`)) return
    remove.mutateAsync(category.id).then(onDone, () => {})
  }

  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onDone()}
      title={category ? `Edit ${category.name}` : 'New category'}
      description="Categories group dishes in the customer app’s menu."
      onSubmit={submit}
      submitLabel={category ? 'Save changes' : 'Create category'}
      pending={save.isPending}
      error={save.error ?? remove.error}
      onDelete={category ? handleDelete : undefined}
      deleting={remove.isPending}
    >
      <div className="grid grid-cols-[1fr_6rem] gap-space-md">
        <FormField label="Name" htmlFor="cat-name">
          <Input
            id="cat-name"
            className="h-10 bg-surface"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }))}
            required
            autoFocus
          />
        </FormField>
        <FormField label="Emoji" htmlFor="cat-emoji">
          <Input id="cat-emoji" className="h-10 bg-surface text-center text-headline-sm" maxLength={4} value={form.emoji} onChange={(e) => set('emoji')(e.target.value)} />
        </FormField>
      </div>
      <FormField label="URL slug" htmlFor="cat-slug">
        <Input
          id="cat-slug"
          className="h-10 bg-surface"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true)
            set('slug')(e.target.value)
          }}
          required
        />
      </FormField>
      <FormField label="Image" htmlFor="cat-image">
        <ImageField id="cat-image" value={form.imageUrl} onChange={set('imageUrl')} />
      </FormField>
      <FormField label="Sort order" htmlFor="cat-sort" hint="Lower numbers appear first.">
        <NumberInput id="cat-sort" value={form.sortOrder} onChange={set('sortOrder')} />
      </FormField>
      <div className="rounded-xl bg-surface-container-low p-space-md">
        <CheckboxRow label="Visible in the app" checked={form.isActive} onChange={set('isActive')} />
      </div>
    </FormSheet>
  )
}

export function CategoriesPage() {
  const { list, save, remove } = useCategories()
  const [editing, setEditing] = useState(null) // null = closed, {} = new, category = edit

  const close = () => {
    save.reset()
    remove.reset()
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Categories"
        description="Group dishes into menu sections such as Biryani, Pizza and Desserts."
        actions={
          <Button variant="primary" onClick={() => setEditing({})}>
            <Plus /> New Category
          </Button>
        }
      />

      <QueryState query={list}>
        {(categories) =>
          categories.length === 0 ? (
            <Card className="p-space-xl">
              <EmptyState icon={Shapes} title="No categories yet">
                Create your first category to organise the menu.
              </EmptyState>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {[...categories]
                .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                .map((c) => (
                  <Card key={c.id} className={`flex items-center gap-space-md p-space-md ${c.isActive ? '' : 'opacity-60'}`}>
                    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary-fixed text-headline-md">
                      {c.imageUrl ? <img src={c.imageUrl} alt="" className="size-full object-cover" /> : (c.emoji ?? '🍽️')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-headline-sm text-on-surface">{c.name}</h2>
                      <Link to={`/menu-items`} className="text-body-sm text-on-surface-variant hover:text-primary">
                        {c.menuItemCount} {c.menuItemCount === 1 ? 'dish' : 'dishes'} · /{c.slug}
                      </Link>
                    </div>
                    <Switch
                      checked={c.isActive}
                      onCheckedChange={(isActive) => save.mutateAsync({ id: c.id, isActive }).catch((e) => window.alert(e.message))}
                      aria-label={`${c.name} visible in the app`}
                    />
                    <Button variant="icon" size="icon-sm" onClick={() => setEditing(c)}>
                      <Pencil />
                      <span className="sr-only">Edit {c.name}</span>
                    </Button>
                  </Card>
                ))}
            </div>
          )
        }
      </QueryState>

      {editing && <CategoryForm key={editing.id ?? 'new'} category={editing.id ? editing : null} save={save} remove={remove} onDone={close} />}
    </div>
  )
}
