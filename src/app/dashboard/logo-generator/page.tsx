import { PageHeader } from "@/components/page-header"
import { LogoGeneratorForm } from "@/components/logo-generator-form"

export default function LogoGeneratorPage() {
  return (
    <>
      <PageHeader
        title="AI Logo Generator"
        description="Create unique logo concepts in seconds with the power of AI."
      />
      <LogoGeneratorForm />
    </>
  )
}
