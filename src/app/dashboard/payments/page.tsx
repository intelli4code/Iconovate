import { PaymentList } from "@/components/payments/payment-list";
import { PageHeader } from "@/components/page-header";

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payment Approvals"
        description="Review and approve payment notifications submitted by clients."
      />
      <PaymentList />
    </>
  );
}
