
import { PageHeader } from "@/components/page-header";
import { SiteTextManager } from "@/components/web-editing/site-text-manager";

export default function ManageSiteTextPage() {
  return (
    <>
      <PageHeader
        title="Manage Site Text"
        description="Update headlines and descriptions across your public website."
      />
      <SiteTextManager />
    </>
  );
}
