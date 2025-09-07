

"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, serverTimestamp, where, getDocs, updateDoc, arrayUnion, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { sendProjectCreationEmail } from "@/app/actions/send-project-creation-email";

import type { ProjectRequest, Project, ProjectStatus, ProjectPaymentStatus, TeamMember, Task, ProjectType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { generateTasksFromBrief } from "@/ai/flows/task-generator";
import { Input } from "../ui/input";
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Checkbox } from "../ui/checkbox";

const projectTypes: ProjectType[] = ['Branding', 'Web Design', 'UI/UX', 'Marketing', 'Other'];

const formSchema = z.object({
  name: z.string().min(3, "Project name is required."),
  description: z.string().optional(),
  projectType: z.enum(projectTypes, { required_error: "Please select a project type." }),
  revisionLimit: z.coerce.number().min(0, "Revision limit must be 0 or more.").default(3),
  durationDays: z.coerce.number().min(1, "Duration must be at least 1 day.").default(30),
  team: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You must assign at least one designer.",
  }),
});
type FormValues = z.infer<typeof formSchema>;


export function ReturningOrdersList() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [designers, setDesigners] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revisionLimit: 3,
      durationDays: 30,
      team: [],
      projectType: 'Other',
    },
  });

  useEffect(() => {
    setLoading(true);
    const requestsQuery = query(collection(db, "projectRequests"), orderBy("requestedAt", "desc"));
    const designersQuery = query(collection(db, "teamMembers"), where("role", "==", "Designer"));
    
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectRequest)));
      setLoading(false);
    });

    const unsubscribeDesigners = onSnapshot(designersQuery, (snapshot) => {
        setDesigners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
    });

    return () => {
        unsubscribeRequests();
        unsubscribeDesigners();
    };
  }, []);

  const handleOpenDialog = (request: ProjectRequest) => {
    setSelectedRequest(request);
    form.reset({
        name: `New Project for ${request.clientName}`,
        description: "",
        revisionLimit: 3,
        durationDays: 30,
        team: [],
        projectType: 'Other',
    });
    setIsDialogOpen(true);
  };
  
  const handleApproveRequest = async (data: FormValues) => {
    if (!selectedRequest) return;
    
    try {
        const futureDate = addDays(new Date(), data.durationDays);

        const aiTasksResult = await generateTasksFromBrief({ briefDescription: selectedRequest.brief });
        const newTasks: Task[] = aiTasksResult.tasks.map(task => ({
            id: uuidv4(),
            text: task.text,
            completed: false,
        }));

        const newProjectData: Omit<Project, 'id' | 'createdAt'> & { createdAt: any } = {
            name: data.name,
            client: selectedRequest.clientName,
            clientEmail: selectedRequest.clientEmail,
            description: data.description || "New project requested by a returning client.",
            briefDescription: selectedRequest.brief,
            status: "In Progress" as ProjectStatus,
            paymentStatus: "Unpaid" as ProjectPaymentStatus,
            dueDate: format(futureDate, "yyyy-MM-dd"),
            team: data.team,
            feedback: [],
            tasks: newTasks,
            assets: [],
            notifications: [{ id: uuidv4(), text: 'Project created from returning client request.', timestamp: new Date().toISOString()}],
            createdAt: serverTimestamp(),
            projectType: data.projectType,
            revisionLimit: data.revisionLimit,
            revisionsUsed: 0,
        };

        const newProjectRef = await addDoc(collection(db, 'projects'), newProjectData);

        await sendProjectCreationEmail({ ...newProjectData, id: newProjectRef.id });
        
        await deleteDoc(doc(db, "projectRequests", selectedRequest.id));
        
        toast({ title: "Project Approved!", description: "A new project has been created and the client has been notified." });
        setIsDialogOpen(false);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Approval Failed" });
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projectRequests", id));
      toast({ title: "Request Deleted" });
    } catch (error) {
      toast({ variant: 'destructive', title: "Deletion Failed" });
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>New project requests from your existing clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : pendingRequests.length === 0 ? (
            <p className="text-center text-muted-foreground p-8">No pending requests.</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <Card key={request.id} className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <p className="font-semibold">{request.clientName}</p>
                      <p className="text-sm text-muted-foreground">{request.clientEmail}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested {request.requestedAt ? formatDistanceToNow(request.requestedAt.toDate(), { addSuffix: true }) : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Button onClick={() => handleOpenDialog(request)}>Review & Approve</Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <XCircle className="mr-2 h-4 w-4"/>
                                Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this project request.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRequest(request.id)} className="bg-destructive hover:bg-destructive/90">Yes, reject</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.brief}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                  <DialogTitle>Approve New Project</DialogTitle>
                  <DialogDescription>
                     Create a new project from this request. Client: <span className="font-semibold text-primary">{selectedRequest?.clientName}</span>
                  </DialogDescription>
              </DialogHeader>
               <Form {...form}>
                <form onSubmit={form.handleSubmit(handleApproveRequest)} id="new-project-from-request-form">
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Client Brief</Label>
                        <Textarea value={selectedRequest?.brief} readOnly rows={4} className="bg-muted"/>
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Briefly describe the project goals..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                    </div>
                    <div className="space-y-2">
                       <FormField
                          control={form.control}
                          name="projectType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Type</FormLabel>
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {projectTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormField
                            control={form.control}
                            name="revisionLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Revision Limit</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                      </div>
                      <div className="space-y-2">
                        <FormField
                            control={form.control}
                            name="durationDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (days)</FormLabel>
                                <FormControl>
                                   <Input type="number" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="team"
                        render={() => (
                          <FormItem>
                            <FormLabel>Assign Designers</FormLabel>
                              <div className="space-y-2 rounded-md border p-3 max-h-32 overflow-y-auto">
                                <>
                                  {designers.map((designer) => (
                                    <FormField
                                      key={designer.id}
                                      control={form.control}
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
                                </>
                              </div>
                          </FormItem>
                        )}
                      />
                      {form.formState.errors.team && <p className="text-sm text-destructive mt-1">{form.formState.errors.team.message}</p>}
                    </div>
                  </div>
                </form>
              </Form>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" form="new-project-from-request-form" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Approve & Create Project
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
