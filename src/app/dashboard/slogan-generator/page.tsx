import { PageHeader } from "@/components/page-header"
import { SloganGeneratorForm } from "@/components/slogan-generator-form"

export default function SloganGeneratorPage() {
  return (
    <>
      <PageHeader
        title="AI Slogan Generator"
        description="Brainstorm catchy slogans and taglines for your brand in seconds."
      />
      <SloganGeneratorForm />
    </>
  )
}
