

"use client"

import * as React from "react"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
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
import type { Project, ProjectStatus, ProjectType, TeamMember } from "@/types"
import { ListFilter, PlusCircle, MoreHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, differenceInDays, parseISO } from "date-fns"
import { db } from "@/lib/firebase"
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"


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

const projectTypes: ProjectType[] = ['Branding', 'Web Design', 'UI/UX', 'Marketing', 'Other'];
const allStatuses: ProjectStatus[] = ['Awaiting Brief', 'Pending Approval', 'In Progress', 'Pending Feedback', 'Completed', 'Blocked', 'Canceled', 'Cancellation Requested', 'Revision Requested'];

const formSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters."),
  client: z.string().min(3, "Client name must be at least 3 characters."),
  description: z.string().optional(),
  projectType: z.enum(projectTypes, { required_error: "Please select a project type." }),
  revisionLimit: z.coerce.number().min(0, "Revision limit must be 0 or more.").default(3),
  durationDays: z.coerce.number().min(1, "Duration must be at least 1 day.").default(30),
  team: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You must assign at least one designer.",
  }),
});
type FormValues = z.infer<typeof formSchema>;


export function ProjectList() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [designers, setDesigners] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState("all");
  const [statusFilters, setStatusFilters] = React.useState<ProjectStatus[]>([]);

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revisionLimit: 3,
      durationDays: 30,
      team: [],
    },
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

    const designersQuery = query(collection(db, "teamMembers"), where("role", "==", "Designer"));
    const unsubscribeDesigners = onSnapshot(designersQuery, (snapshot) => {
        const designersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[];
        setDesigners(designersData);
    });

    return () => {
        unsubscribe();
        unsubscribeDesigners();
    };
  }, [toast]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + data.durationDays);

    const newProjectData = {
      name: data.name,
      client: data.client,
      description: data.description || "No description provided.",
      status: "Awaiting Brief" as ProjectStatus,
      dueDate: format(futureDate, "yyyy-MM-dd"),
      team: [...data.team, "Hamza"],
      feedback: [],
      tasks: [],
      assets: [],
      notifications: [],
      createdAt: serverTimestamp(),
      projectType: data.projectType,
      revisionLimit: data.revisionLimit,
      revisionsUsed: 0,
      briefDescription: "",
      briefLinks: "",
    };

    try {
      await addDoc(collection(db, 'projects'), newProjectData);
      
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

  const handleStatusFilterChange = (status: ProjectStatus) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const filteredProjects = React.useMemo(() => {
    return projects.filter(project => {
        const tabMatch = activeTab === 'all' ||
            (activeTab === 'active' && ['In Progress', 'Pending Feedback', 'Blocked', 'Awaiting Brief', 'Pending Approval', 'Cancellation Requested', 'Revision Requested'].includes(project.status)) ||
            (activeTab === 'completed' && project.status === 'Completed') ||
            (activeTab === 'archived' && project.status === 'Canceled');
        
        const statusMatch = statusFilters.length === 0 || statusFilters.includes(project.status);

        return tabMatch && statusMatch;
    });
  }, [projects, activeTab, statusFilters]);

  const renderTable = (projectsToRender: Project[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Project Name</TableHead>
          <TableHead>Client</TableHead>
          <TableHead className="hidden sm:table-cell">Order ID</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Time Remaining</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              <div className="flex justify-center items-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading projects...
              </div>
            </TableCell>
          </TableRow>
        ) : projectsToRender.length === 0 ? (
           <TableRow>
            <TableCell colSpan={6} className="text-center h-24">
                No projects found for this view.
            </TableCell>
          </TableRow>
        ) : (
          projectsToRender.map(project => {
            const daysRemaining = differenceInDays(parseISO(project.dueDate), new Date());
            return (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>{project.client}</TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-xs">{project.id}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className={statusStyles[project.status]}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{daysRemaining >= 0 ? `${daysRemaining} days` : 'Past due'}</TableCell>
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
            )
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
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
              {allStatuses.map(status => (
                 <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters.includes(status)}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                 >
                    {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Project
              </span>
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details below to start a new project.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} id="new-project-form">
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" {...register("name")} placeholder="e.g. Aether-Core Rebrand" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client Name</Label>
                    <Input id="client" {...register("client")} placeholder="e.g. Aether-Core Dynamics" />
                    {errors.client && <p className="text-sm text-destructive mt-1">{errors.client.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...register("description")} placeholder="Briefly describe the project goals..." />
                    {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Project Type</Label>
                      <Controller
                        name="projectType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                              <SelectContent>
                                {projectTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        )}
                      />
                    {errors.projectType && <p className="text-sm text-destructive mt-1">{errors.projectType.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label htmlFor="revisionLimit">Revision Limit</Label>
                      <Input id="revisionLimit" type="number" {...register("revisionLimit")} />
                      {errors.revisionLimit && <p className="text-sm text-destructive mt-1">{errors.revisionLimit.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="durationDays">Duration (days)</Label>
                      <Input id="durationDays" type="number" {...register("durationDays")} />
                      {errors.durationDays && <p className="text-sm text-destructive mt-1">{errors.durationDays.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Designers</Label>
                    <div className="space-y-2 rounded-md border p-3 max-h-48 overflow-y-auto">
                      <FormField
                        control={control}
                        name="team"
                        render={() => (
                          <>
                            {designers.map((designer) => (
                              <FormField
                                key={designer.id}
                                control={control}
                                name="team"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={designer.id}
                                      className="flex flex-row items-center space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(designer.name)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), designer.name])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== designer.name
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {designer.name}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                            {designers.length === 0 && <p className="text-xs text-muted-foreground p-2 text-center">No designers available. Add one in the Team page.</p>}
                          </>
                        )}
                      />
                    </div>
                    {errors.team && <p className="text-sm text-destructive mt-1">{errors.team.message}</p>}
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
            {renderTable(filteredProjects)}
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="active">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>
              Projects that are currently in progress or awaiting feedback.
            </CardDescription>
          </CardHeader>
           <CardContent>
            {renderTable(filteredProjects)}
           </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="completed">
        <Card>
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
            <CardDescription>
              A log of all successfully completed projects.
            </CardDescription>
          </CardHeader>
           <CardContent>
            {renderTable(filteredProjects)}
           </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="archived">
        <Card>
          <CardHeader>
            <CardTitle>Archived Projects</CardTitle>
            <CardDescription>
              Canceled or otherwise archived projects.
            </CardDescription>
          </CardHeader>
           <CardContent>
            {renderTable(filteredProjects)}
           </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
