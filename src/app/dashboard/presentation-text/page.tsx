import { PageHeader } from "@/components/page-header"
import { PresentationTextForm } from "@/components/presentation-text-form"

export default function PresentationTextPage() {
  return (
    <>
      <PageHeader
        title="Presentation Text Tool"
        description="Generate high-quality, personalized text for your design presentations instantly."
      />
      <PresentationTextForm />
    </>
  )
}
