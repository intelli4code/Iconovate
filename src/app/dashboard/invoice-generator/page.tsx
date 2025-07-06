import { InvoiceGeneratorForm } from "@/components/invoice-generator-form";
import { PageHeader } from "@/components/page-header";

export default function InvoiceGeneratorPage() {
  return (
    <>
      <PageHeader
        title="AI Invoice Generator"
        description="Quickly generate professional invoices from project details."
      />
      <InvoiceGeneratorForm />
    </>
  );
}
