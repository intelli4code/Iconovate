import { PageHeader } from "@/components/page-header"
import { MoodBoardForm } from "@/components/mood-board-form"

export default function MoodBoardPage() {
  return (
    <>
      <PageHeader
        title="AI Mood Board Generator"
        description="Describe your brand's vision and let AI create a stunning visual mood board."
      />
      <MoodBoardForm />
    </>
  )
}
