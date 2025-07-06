import { PageHeader } from "@/components/page-header"
import { LogoVariationForm } from "@/components/logo-variation-form"

export default function LogoVariationsPage() {
  return (
    <>
      <PageHeader
        title="AI Logo Variation Generator"
        description="Automatically create monogram, icon-only, or wordmark variations of your logo."
      />
      <LogoVariationForm />
    </>
  )
}
