import { SocialMediaPostsForm } from "@/components/social-media-posts-form";
import { PageHeader } from "@/components/page-header";

export default function SocialMediaPostsPage() {
  return (
    <>
      <PageHeader
        title="AI Social Media Post Generator"
        description="Generate a week's worth of social media content tailored to your brand."
      />
      <SocialMediaPostsForm />
    </>
  );
}
