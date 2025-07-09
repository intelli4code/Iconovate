
import { PageHeader } from "@/components/page-header";
import { PricingManager } from "@/components/web-editing/pricing-manager";

export default function ManagePricingPage() {
  return (
    <>
      <PageHeader
        title="Manage Pricing"
        description="Update your service tiers and pricing details."
      />
      <PricingManager />
    </>
  );
}
