"use client"

import * as React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Project, ProjectStatus } from "@/types"
import { ListFilter, PlusCircle, MoreHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"


const statusStyles: { [key in ProjectStatus]: string } = {
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
  'Pending Feedback': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
  'Blocked': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300',
  'Canceled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300',
  'Approved': 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border-teal-300',
};

const formSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters."),
  client: z.string().min(3, "Client name must be at least 3 characters."),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;


export function ProjectList() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  
  React.useEffect(() => {
    setLoading(true);
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Failed to load projects",
        description: "Could not fetch project data from the database.",
      });
    });

    return () => unsubscribe();
  }, [toast]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const newProjectData = {
      name: data.name,
      client: data.client,
      description: data.description || "No description provided.",
      status: "In Progress" as ProjectStatus,
      dueDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
      team: ["Alex"],
      feedback: [],
      tasks: [],
      assets: [],
      createdAt: serverTimestamp(),
    };

    try {
      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, newProjectData);
      // Now update the document to include its own ID, useful for client-side logic
      await updateDoc(docRef, { id: docRef.id });
      
      reset();
      setIsDialogOpen(false);
      toast({
        title: "Project Created",
        description: `${data.name} has been successfully created.`,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the project. Please try again.",
      });
    }
  };

  // TODO: Add filtering logic based on tabs
  const filteredProjects = projects;

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived" className="hidden sm:flex">
            Archived
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                In Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Blocked</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Project
              </span>
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details below to start a new project.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} id="new-project-form">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Project Name
                    </Label>
                    <div className="col-span-3">
                      <Input id="name" {...register("name")} placeholder="e.g. Aether-Core Rebrand" />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="client" className="text-right">
                      Client Name
                    </Label>
                    <div className="col-span-3">
                      <Input id="client" {...register("client")} placeholder="e.g. Aether-Core Dynamics" />
                      {errors.client && <p className="text-sm text-destructive mt-1">{errors.client.message}</p>}
                    </div>
                  </div>
                   <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description
                    </Label>
                     <div className="col-span-3">
                      <Textarea id="description" {...register("description")} placeholder="Briefly describe the project goals..." />
                      {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                    </div>
                  </div>
                </div>
              </form>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" form="new-project-form">Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Manage all your branding projects and view their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading projects...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                   <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No projects found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map(project => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className={statusStyles[project.status]}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{project.dueDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/projects/${project.id}`} className="w-full cursor-pointer">
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
