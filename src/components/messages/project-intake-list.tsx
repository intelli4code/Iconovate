

"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ContactMessage, Project, ProjectStatus, ProjectType, TeamMember, ProjectPaymentStatus, Task } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { sendProjectCreationEmail } from "@/app/actions/send-project-creation-email";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";


const statusStyles: { [key in ContactMessage['status']]: string } = {
  'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
  'Contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300',
  'Converted': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
  'Archived': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300',
  'Declined': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300'
};

const projectCreationSchema = z.object({
  name: z.string().min(3, "Project name is required."),
  durationDays: z.coerce.number().min(1, "Duration is required."),
  revisionLimit: z.coerce.number().min(0, "Revisions must be 0 or more."),
  team: z.array(z.string()).min(1, "At least one designer must be assigned."),
});

type ProjectCreationValues = z.infer<typeof projectCreationSchema>;

export function ProjectIntakeList() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<ContactMessage['status'] | 'All'>('New');
  
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  const [services, setServices] = useState<string[]>([]);
  const [designers, setDesigners] = useState<TeamMember[]>([]);

  const form = useForm<ProjectCreationValues>({
    resolver: zodResolver(projectCreationSchema),
  });

  useEffect(() => {
    setLoading(true);
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage)));
      setLoading(false);
    });

    const servicesQuery = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
        setServices(snapshot.docs.map(doc => doc.data().title));
    });

    const designersQuery = query(collection(db, "teamMembers"), orderBy("name", "asc"));
     const unsubscribeDesigners = onSnapshot(designersQuery, (snapshot) => {
        setDesigners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
    });

    return () => {
        unsubscribe();
        unsubscribeServices();
        unsubscribeDesigners();
    };
  }, []);

  const handleStatusUpdate = async (id: string, status: ContactMessage['status']) => {
      await updateDoc(doc(db, "messages", id), { status: status });
      toast({ title: "Status Updated", description: `Message marked as ${status}.`});
  }

  const handleStartProject = (message: ContactMessage) => {
    setSelectedMessage(message);
    form.reset({
        name: `Project for ${message.name}`,
        durationDays: 30,
        revisionLimit: 3,
        team: [],
    })
    setIsDetailsOpen(false);
    setIsProjectModalOpen(true);
  }
  
  const onProjectCreateSubmit = async (data: ProjectCreationValues) => {
    if (!selectedMessage) return;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + data.durationDays);

    const newProjectData: Omit<Project, 'id' | 'createdAt'> & { createdAt: any } = {
        name: data.name,
        client: selectedMessage.name,
        clientEmail: selectedMessage.email,
        description: selectedMessage.description,
        status: "In Progress" as ProjectStatus,
        paymentStatus: "Unpaid" as ProjectPaymentStatus,
        dueDate: format(futureDate, "yyyy-MM-dd"),
        team: data.team,
        feedback: [],
        tasks: [],
        assets: [],
        notifications: [],
        createdAt: serverTimestamp(),
        projectType: selectedMessage.service as ProjectType,
        revisionLimit: data.revisionLimit,
        revisionsUsed: 0,
    };
    
    try {
        const newDocRef = await addDoc(collection(db, 'projects'), newProjectData);
        await sendProjectCreationEmail({ ...newProjectData, id: newDocRef.id });
        await handleStatusUpdate(selectedMessage.id, 'Converted');

        toast({ title: "Project Created!", description: `${data.name} is now live and the client has been notified.` });
        setIsProjectModalOpen(false);
    } catch (error) {
        toast({ variant: "destructive", title: "Project Creation Failed" });
    }
  }

  const filteredMessages = messages.filter(message => 
      activeFilter === 'All' || (message.status || 'New') === activeFilter
  );

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Project Intake Requests</CardTitle>
        <CardDescription>New leads from your website contact form.</CardDescription>
        <div className="flex gap-2 pt-2 flex-wrap">
            {(['New', 'Contacted', 'Converted', 'Declined', 'Archived', 'All'] as const).map(status => (
                <Button key={status} variant={activeFilter === status ? 'default' : 'outline'} onClick={() => setActiveFilter(status)}>
                    {status}
                </Button>
            ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">No messages in this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMessages.map((message) => (
              <Card 
                key={message.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onDoubleClick={() => { setSelectedMessage(message); setIsDetailsOpen(true); }}
              >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{message.name}</CardTitle>
                         <Badge variant="outline" className={statusStyles[message.status || 'New']}>{message.status || 'New'}</Badge>
                    </div>
                    <CardDescription>{message.email}</CardDescription>
                    <p className="text-xs text-muted-foreground pt-1">ID: {message.proposalId}</p>
                  </CardHeader>
                  <CardContent>
                      <p className="font-semibold text-sm">{message.service}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Received {formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true })}
                      </p>
                  </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Project Request Details</DialogTitle>
                <DialogDescription>From {selectedMessage?.name} ({selectedMessage?.email})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                <div className="font-semibold">Proposal ID: <span className="font-mono text-xs bg-muted p-1 rounded">{selectedMessage?.proposalId}</span></div>
                <div className="font-semibold">Service: <span className="font-normal text-primary">{selectedMessage?.service}</span></div>
                <div>
                    <Label className="font-semibold">Description</Label>
                    <p className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">{selectedMessage?.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label className="font-semibold">Budget:</Label> <p>{selectedMessage?.budget}</p></div>
                    <div><Label className="font-semibold">Duration:</Label> <p>{selectedMessage?.duration}</p></div>
                    <div><Label className="font-semibold">Revisions:</Label> <p>{selectedMessage?.revisions}</p></div>
                    <div><Label className="font-semibold">Source Files:</Label> <p>{selectedMessage?.sourceFiles}</p></div>
                </div>
            </div>
            <DialogFooter className="justify-between">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <XCircle className="mr-2 h-4 w-4"/> Decline Request
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will mark the request as "Declined" and it will be moved from the "New" queue.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { handleStatusUpdate(selectedMessage!.id, 'Declined'); setIsDetailsOpen(false);}} className="bg-destructive hover:bg-destructive/90">Yes, Decline</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
                <Button onClick={() => handleStartProject(selectedMessage!)}>
                    <CheckCircle className="mr-2 h-4 w-4"/> Start Project
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Confirm details to start this new project.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form id="project-create-form" onSubmit={form.handleSubmit(onProjectCreateSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <div>
                        <Label>Project Type</Label>
                        <Input value={selectedMessage?.service} disabled />
                    </div>
                     <div>
                        <Label>Project Description</Label>
                        <Textarea value={selectedMessage?.description} disabled rows={4} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="durationDays" render={({ field }) => (
                            <FormItem><FormLabel>Duration (Days)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="revisionLimit" render={({ field }) => (
                            <FormItem><FormLabel>Revisions</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                     </div>
                      <FormField
                        control={form.control}
                        name="team"
                        render={() => (
                          <FormItem>
                            <FormLabel>Assign Designers</FormLabel>
                              <div className="space-y-2 rounded-md border p-3 max-h-32 overflow-y-auto">
                                  {designers.map((d) => (
                                    <FormField
                                      key={d.id}
                                      control={form.control}
                                      name="team"
                                      render={({ field }) => (
                                          <FormItem key={d.id} className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(d.name)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...(field.value || []), d.name])
                                                    : field.onChange(field.value?.filter((value) => value !== d.name));
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal">{d.name}</FormLabel>
                                          </FormItem>
                                      )}
                                    />
                                  ))}
                              </div>
                          </FormItem>
                        )}
                      />
                </form>
            </Form>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
                <Button type="submit" form="project-create-form" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Create Project"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
