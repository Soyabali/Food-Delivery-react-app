import { ImageOff, Loader2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUploadImage } from '@/hooks/queries'

/** Image URL input with an "Upload" button (POST /admin/uploads) and preview. */
export function ImageField({ id, value, onChange }) {
  const fileRef = useRef(null)
  const upload = useUploadImage()

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const { url } = await upload.mutateAsync(file)
    onChange(url)
  }

  return (
    <div className="space-y-space-sm">
      <div className="flex gap-space-sm">
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImageOff className="size-4 text-on-surface-variant" aria-hidden="true" />
          )}
        </span>
        <Input
          id={id}
          type="url"
          className="h-10 bg-surface"
          placeholder="https://… or upload a photo"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
        <Button variant="neutral" className="h-10" onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
          {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
          <span className="hidden sm:inline">Upload</span>
        </Button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </div>
      {upload.isError && <p className="text-body-sm text-error">{upload.error.message}</p>}
    </div>
  )
}
