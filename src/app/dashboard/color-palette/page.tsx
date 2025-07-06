import { PageHeader } from "@/components/page-header"
import { ColorPaletteForm } from "@/components/color-palette-form"

export default function ColorPalettePage() {
  return (
    <>
      <PageHeader
        title="AI Color Palette Generator"
        description="Describe your brand's vibe and get a custom color palette in seconds."
      />
      <ColorPaletteForm />
    </>
  )
}
