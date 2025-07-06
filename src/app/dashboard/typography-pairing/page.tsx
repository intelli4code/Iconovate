import { PageHeader } from "@/components/page-header"
import { TypographyPairingForm } from "@/components/typography-pairing-form"

export default function TypographyPairingPage() {
  return (
    <>
      <PageHeader
        title="AI Typography Pairing"
        description="Get professional font pairing suggestions that match your brand's personality."
      />
      <TypographyPairingForm />
    </>
  )
}
