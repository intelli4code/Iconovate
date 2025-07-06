import { ClientList } from "@/components/clients/client-list";
import { PageHeader } from "@/components/page-header";

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage your clients and view their project history."
      />
      <ClientList />
    </>
  );
}
