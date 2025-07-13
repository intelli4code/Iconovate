
import { PageHeader } from "@/components/page-header";
import { StatsManager } from "@/components/web-editing/stats-manager";

export default function ManageStatsPage() {
  return (
    <>
      <PageHeader
        title="Manage Site Statistics"
        description="Add, edit, or delete the stats displayed on your website."
      />
      <StatsManager />
    </>
  );
}
