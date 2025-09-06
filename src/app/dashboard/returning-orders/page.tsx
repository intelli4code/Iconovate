
import { ReturningOrdersList } from "@/components/returning-orders/list";
import { PageHeader } from "@/components/page-header";

export default function ReturningOrdersPage() {
  return (
    <>
      <PageHeader
        title="Returning Orders"
        description="Review and approve new project requests from existing clients."
      />
      <ReturningOrdersList />
    </>
  );
}
