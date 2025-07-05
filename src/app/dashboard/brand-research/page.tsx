import { PageHeader } from "@/components/page-header"
import { BrandResearchForm } from "@/components/brand-research-form"

export default function BrandResearchPage() {
  return (
    <>
      <PageHeader
        title="AI Brand Research"
        description="Automate your discovery phase. Get deep market and competitor insights in minutes."
      />
      <BrandResearchForm />
    </>
  )
}
