import { DesignerStats } from "@/components/designers/designer-stats";
import { PageHeader } from "@/components/page-header";

export default function DesignersPage() {
  return (
    <>
      <PageHeader
        title="Designer Analytics"
        description="View performance metrics and credentials for your design team."
      />
      <DesignerStats />
    </>
  );
}
