
import { PageHeader } from "@/components/page-header";
import { FooterManager } from "@/components/web-editing/footer-manager";

export default function ManageFooterPage() {
  return (
    <>
      <PageHeader
        title="Manage Footer"
        description="Edit the link columns in your website's footer."
      />
      <FooterManager />
    </>
  );
}
