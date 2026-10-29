import { PageHeader } from '@/components/shared/PageHeader'
import {
  BadgesSection,
  DataTableSection,
  FeedbackSections,
  FormControlsSection,
  SkeletonSection,
} from '@/sections/design-system/ComponentSections'
import { ButtonMatrix, TokensSection } from '@/sections/design-system/FoundationSections'

/** Living component sheet: renders the real shared components, not copies. */
export function DesignSystemPage() {
  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        eyebrow={
          <>
            <span className="rounded-full bg-secondary-fixed px-space-sm py-0.5 text-label-sm text-primary uppercase">Spec v2.4.0</span>
            <span className="text-label-sm text-on-surface-variant">• System Guidelines</span>
            <span className="rounded-full bg-surface-container px-space-sm py-0.5 text-label-sm text-on-surface">Light Theme Default</span>
          </>
        }
        title="Apna Food Design Tokens & Component Matrix"
        description="Living architectural component sheet for mission-critical hyperlocal dispatch, merchant operations, and merchant portal experiences across Bengaluru micro-markets."
      />
      <TokensSection />
      <ButtonMatrix />
      <FormControlsSection />
      <BadgesSection />
      <DataTableSection />
      <FeedbackSections />
      <SkeletonSection />
    </div>
  )
}
