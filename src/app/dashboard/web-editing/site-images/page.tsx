
import { PageHeader } from "@/components/page-header";
import { SiteImagesManager } from "@/components/web-editing/site-images-manager";

export default function ManageSiteImagesPage() {
  return (
    <>
      <PageHeader
        title="Manage Site Images"
        description="Update key images across your public website."
      />
      <SiteImagesManager />
    </>
  );
}
