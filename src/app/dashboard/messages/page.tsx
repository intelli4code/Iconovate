

import { ProjectIntakeList } from "@/components/messages/project-intake-list";
import { PageHeader } from "@/components/page-header";

export default function ProjectIntakePage() {
  return (
    <>
      <PageHeader
        title="Project Intake"
        description="View and manage new project requests from your contact form."
      />
      <ProjectIntakeList />
    </>
  );
}
