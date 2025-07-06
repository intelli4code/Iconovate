import { PageHeader } from "@/components/page-header"
import { LogoMockupForm } from "@/components/logo-mockup-form"

export default function LogoMockupsPage() {
  return (
    <>
      <PageHeader
        title="Logo Mockup Generator"
        description="Instantly visualize your logo designs on realistic mockups using AI."
      />
      <LogoMockupForm />
    </>
  )
}
