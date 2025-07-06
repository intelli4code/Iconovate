import { PageHeader } from "@/components/page-header"
import { IconGeneratorForm } from "@/components/icon-generator-form"

export default function IconGeneratorPage() {
  return (
    <>
      <PageHeader
        title="AI Icon Set Generator"
        description="Describe a style and list of concepts to generate a cohesive icon set."
      />
      <IconGeneratorForm />
    </>
  )
}
