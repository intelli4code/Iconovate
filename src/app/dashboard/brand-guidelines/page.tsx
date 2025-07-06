import { PageHeader } from "@/components/page-header"
import { BrandGuidelinesForm } from "@/components/brand-guidelines-form"

export default function BrandGuidelinesPage() {
  return (
    <>
      <PageHeader
        title="Instant Brand Guidelines"
        description="Generate a comprehensive brand identity document from your design assets in seconds."
      />
      <BrandGuidelinesForm />
    </>
  )
}
