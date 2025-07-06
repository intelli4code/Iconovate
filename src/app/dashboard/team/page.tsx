
import { PageHeader } from "@/components/page-header";
import { TeamList } from "@/components/team/team-list";

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team Management"
        description="Invite new members, manage roles, and keep your team organized."
      />
      <TeamList />
    </>
  );
}
