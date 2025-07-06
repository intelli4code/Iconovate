import { PageHeader } from "@/components/page-header"
import { SocialMediaKitForm } from "@/components/social-media-kit-form"

export default function SocialMediaKitPage() {
  return (
    <>
      <PageHeader
        title="AI Social Media Kit Generator"
        description="Instantly create profile pictures and banners for your social media accounts."
      />
      <SocialMediaKitForm />
    </>
  )
}
