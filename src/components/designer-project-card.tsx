import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project, ProjectStatus } from "@/types"
import { Progress } from "@/components/ui/progress"
import { differenceInDays, parseISO } from "date-fns"

interface DesignerProjectCardProps {
  project: Project;
}

const statusStyles: { [key in ProjectStatus]: string } = {
  'Awaiting Brief': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-300',
  'Pending Approval': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
  'Pending Feedback': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
  'Blocked': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300',
  'Canceled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300',
  'Cancellation Requested': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300',
  'Revision Requested': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 border-pink-300',
};

export function DesignerProjectCard({ project }: DesignerProjectCardProps) {
    const completedTasks = project.tasks?.filter(task => task.completed).length || 0;
    const totalTasks = project.tasks?.length || 0;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const daysRemaining = differenceInDays(parseISO(project.dueDate), new Date());

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>For client: {project.client}</CardDescription>
                <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className={statusStyles[project.status]}>
                        {project.status}
                    </Badge>
                    <Badge variant="secondary">
                        Due: {daysRemaining >= 0 ? `${daysRemaining} days` : 'Past due'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Progress ({completedTasks}/{totalTasks})</p>
                    <Progress value={progressPercentage} className="h-2" />
                 </div>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href={`/designer/projects/${project.id}`}>
                        View Project
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
