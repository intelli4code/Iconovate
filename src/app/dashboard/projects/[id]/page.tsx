import { mockProjects } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { ProjectTabs } from "@/components/projects/project-tabs"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find((p) => p.id === params.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={project.name}
        description={`Managing project for ${project.client}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Client Portal View</Button>
            <Button>Deliver Project</Button>
          </div>
        }
      />
      <ProjectTabs project={project} />
    </div>
  )
}
