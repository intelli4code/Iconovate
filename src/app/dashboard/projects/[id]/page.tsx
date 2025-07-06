"use client"

import { mockProjects } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { ProjectTabs } from "@/components/projects/project-tabs"
import { Button } from "@/components/ui/button"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle } from "lucide-react"

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const project = mockProjects.find((p) => p.id === params.id)

  if (!project) {
    notFound()
  }

  const handleDeliver = () => {
    toast({
      title: "Project Delivered!",
      description: `${project.name} has been marked as completed and the client notified.`,
      action: <CheckCircle className="text-green-500" />,
    })
    // In a real app, this would also trigger a backend API call
    // to update the project status and notify the client.
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={project.name}
        description={`Managing project for ${project.client}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/portal/${project.id}`} target="_blank" rel="noopener noreferrer">
                Client Portal View
              </Link>
            </Button>
            <Button onClick={handleDeliver}>Deliver Project</Button>
          </div>
        }
      />
      <ProjectTabs project={project} />
    </div>
  )
}
