
import { PageHeader } from "@/components/page-header";
import { ServicesManager } from "@/components/web-editing/services-manager";

export default function ManageServicesPage() {
  return (
    <>
      <PageHeader
        title="Manage Services"
        description="Add, edit, or delete the services offered on your website."
      />
      <ServicesManager />
    </>
  );
}
