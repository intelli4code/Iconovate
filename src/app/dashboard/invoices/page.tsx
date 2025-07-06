import { InvoiceList } from "@/components/invoices/invoice-list";
import { PageHeader } from "@/components/page-header";

export default function InvoicesPage() {
  return (
    <>
      <PageHeader
        title="Invoices"
        description="Manage all your client invoices."
      />
      <InvoiceList />
    </>
  );
}
