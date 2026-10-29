import { Check, Copy, ExternalLink, Images, Loader2, Search, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IconInput } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { QueryState } from '@/components/shared/QueryState'
import { useDeleteMedia, useMedia, useUploadImage } from '@/hooks/queries'
import { formatBytes, formatDateTime } from '@/lib/format'

const PAGE_SIZE = 24

// Where each kind of record is edited in the dashboard.
const usageLinks = {
  restaurant: { to: '/restaurants', label: 'Restaurant' },
  menuItem: { to: '/menu-items', label: 'Dish' },
  category: { to: '/categories', label: 'Category' },
  offer: { to: '/offers', label: 'Offer' },
}

function MediaCard({ asset, remove }) {
  const [copied, setCopied] = useState(false)
  const inUse = asset.usedBy.length > 0 || asset.orderItemCount > 0
  const deleting = remove.isPending && remove.variables === asset.id

  const copyUrl = () =>
    navigator.clipboard.writeText(asset.url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })

  const handleDelete = () => {
    if (!window.confirm(`Delete “${asset.originalName}”? The file is removed from the server.`)) return
    remove.mutateAsync(asset.id).catch((e) => window.alert(e.message))
  }

  return (
    <Card as="article" className="flex flex-col overflow-hidden">
      <a href={asset.url} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-surface-container-low">
        <img src={asset.url} alt={asset.originalName} loading="lazy" className="size-full object-cover" />
      </a>
      <div className="flex flex-1 flex-col gap-space-sm p-space-md">
        <div className="min-w-0">
          <h2 className="truncate text-label-lg text-on-surface" title={asset.originalName}>
            {asset.originalName}
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            {formatBytes(asset.sizeBytes)} · {formatDateTime(asset.createdAt)}
            {asset.uploadedBy && ` · ${asset.uploadedBy}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {asset.usedBy.map((u) => (
            <Link
              key={`${u.kind}-${u.id}`}
              to={usageLinks[u.kind].to}
              className="max-w-full truncate rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm text-on-surface hover:text-primary"
            >
              {usageLinks[u.kind].label}: {u.name}
            </Link>
          ))}
          {asset.orderItemCount > 0 && (
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">
              In {asset.orderItemCount} past order {asset.orderItemCount === 1 ? 'line' : 'lines'}
            </span>
          )}
          {!inUse && (
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">Not used</span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-1 pt-space-xs">
          <Button variant="tinted" size="sm" className="flex-1" onClick={copyUrl}>
            {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy URL'}
          </Button>
          <Button asChild variant="icon" size="icon-sm">
            <a href={asset.url} target="_blank" rel="noreferrer">
              <ExternalLink />
              <span className="sr-only">Open {asset.originalName}</span>
            </a>
          </Button>
          <Button
            variant="ghost-danger"
            size="icon-sm"
            onClick={handleDelete}
            disabled={inUse || deleting}
            title={inUse ? 'Images that are in use can’t be deleted' : 'Delete image'}
          >
            {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            <span className="sr-only">Delete {asset.originalName}</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function MediaLibraryPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const media = useMedia({ q: search.trim(), page, pageSize: PAGE_SIZE })
  const upload = useUploadImage()
  const remove = useDeleteMedia()
  const fileRef = useRef(null)
  const [uploadErrors, setUploadErrors] = useState([])

  async function handleFiles(event) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    const errors = []
    for (const file of files) {
      await upload.mutateAsync(file).catch((e) => errors.push(`${file.name}: ${e.message}`))
    }
    setUploadErrors(errors)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Media Library"
        description="Every dish photo and restaurant banner uploaded from the dashboard. Copy a URL to reuse an image anywhere."
        actions={
          <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />} Upload images
          </Button>
        }
      />
      <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFiles} />

      <IconInput
        icon={Search}
        className="max-w-md"
        inputClassName="h-10 bg-surface-container-lowest"
        placeholder="Search by file name"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        aria-label="Search images"
      />

      {uploadErrors.length > 0 && (
        <Card className="space-y-1 bg-error-container/40 p-space-md text-body-sm text-error" role="alert">
          {uploadErrors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </Card>
      )}

      <QueryState query={media}>
        {({ items, total }) =>
          items.length === 0 ? (
            <Card className="p-space-xl">
              <EmptyState
                icon={Images}
                title={search ? 'No images match' : 'No images yet'}
                action={
                  !search && (
                    <Button variant="solid" onClick={() => fileRef.current?.click()}>
                      <Upload /> Upload images
                    </Button>
                  )
                }
              >
                {search
                  ? 'Try a different file name.'
                  : 'Upload JPEG, PNG or WebP photos here, or from any restaurant, dish, category or offer form.'}
              </EmptyState>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {items.map((asset) => (
                  <MediaCard key={asset.id} asset={asset} remove={remove} />
                ))}
              </div>
              {total > PAGE_SIZE && (
                <div className="flex items-center justify-between gap-space-md">
                  <p className="text-body-sm text-on-surface-variant">
                    {total} images
                  </p>
                  <Pagination page={page} pageCount={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
                </div>
              )}
            </>
          )
        }
      </QueryState>
    </div>
  )
}
