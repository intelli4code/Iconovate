
import { PageHeader } from "@/components/page-header";
import { SiteIdentityManager } from "@/components/web-editing/site-identity-manager";

export default function SiteIdentityPage() {
  return (
    <>
      <PageHeader
        title="Manage Site Identity"
        description="Update your website's logo and favicon."
      />
      <SiteIdentityManager />
    </>
  );
}
