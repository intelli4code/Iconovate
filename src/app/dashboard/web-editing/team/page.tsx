
import { PageHeader } from "@/components/page-header";
import { TeamManager } from "@/components/web-editing/team-manager";

export default function ManageTeamPage() {
  return (
    <>
      <PageHeader
        title="Manage Team Display"
        description="Choose which team members are featured on your public website."
      />
      <TeamManager />
    </>
  );
}
