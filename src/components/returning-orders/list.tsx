
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import type { ProjectRequest, Project, ProjectStatus, ProjectPaymentStatus, TeamMember, Task } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { generateTasksFromBrief } from "@/ai/flows/task-generator";

export function ReturningOrdersList() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [designers, setDesigners] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedDesigner, setAssignedDesigner] = useState("");

  useEffect(() => {
    setLoading(true);
    const requestsQuery = query(collection(db, "projectRequests"), orderBy("requestedAt", "desc"));
    const designersQuery = query(collection(db, "teamMembers"), where => where("role", "==", "Designer"));
    
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
    setIsDialogOpen(true);
  };
  
  const handleApproveRequest = async () => {
    if (!selectedRequest || !assignedDesigner) {
        toast({ variant: 'destructive', title: "Please assign a designer."});
        return;
    }
    setIsSubmitting(true);
    try {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30); // Default 30-day duration

        const aiTasksResult = await generateTasksFromBrief({ briefDescription: selectedRequest.brief });
        const newTasks: Task[] = aiTasksResult.tasks.map(task => ({
            id: uuidv4(),
            text: task.text,
            completed: false,
        }));

        const newProjectData: Omit<Project, 'id'> = {
            name: `New Project for ${selectedRequest.clientName}`,
            client: selectedRequest.clientName,
            clientEmail: selectedRequest.clientEmail,
            description: "New project requested by a returning client.",
            briefDescription: selectedRequest.brief,
            status: "In Progress" as ProjectStatus,
            paymentStatus: "Unpaid" as ProjectPaymentStatus,
            dueDate: format(futureDate, "yyyy-MM-dd"),
            team: [assignedDesigner],
            feedback: [],
            tasks: newTasks,
            assets: [],
            notifications: [{ id: uuidv4(), text: 'Project created from returning client request.', timestamp: new Date().toISOString()}],
            createdAt: serverTimestamp(),
            projectType: 'Other',
            revisionLimit: 3,
            revisionsUsed: 0,
        };

        const newProjectRef = await addDoc(collection(db, 'projects'), newProjectData);
        
        // Notify client of their new Order ID
        const notification = {
            id: uuidv4(),
            text: `Your new project request has been approved! Your new Order ID is ${newProjectRef.id}. You can use this to log in to your new project portal.`,
            timestamp: new Date().toISOString()
        }
        
        // This is a bit of a hack - ideally you'd have a user system to push notifications to.
        // For now, we add it to their *last* approved project.
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, where("clientEmail", "==", selectedRequest.clientEmail), orderBy("createdAt", "desc"), limit(1));
        const projectsSnap = await getDocs(q);
        if(!projectsSnap.empty) {
            const lastProjectRef = projectsSnap.docs[0].ref;
            await updateDoc(lastProjectRef, { notifications: arrayUnion(notification) });
        }
        
        await deleteDoc(doc(db, "projectRequests", selectedRequest.id));
        
        toast({ title: "Project Approved!", description: "A new project has been created and the client has been notified." });
        setIsDialogOpen(false);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Approval Failed" });
    } finally {
        setIsSubmitting(false);
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
                        Requested {formatDistanceToNow(request.requestedAt.toDate(), { addSuffix: true })}
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
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Approve New Project</DialogTitle>
                  <DialogDescription>
                      Assign a designer to create a new project from this request.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                  <div>
                      <Label>Client</Label>
                      <p className="font-semibold">{selectedRequest?.clientName}</p>
                  </div>
                  <div>
                      <Label>Brief</Label>
                      <Textarea value={selectedRequest?.brief} readOnly rows={6} className="bg-muted"/>
                  </div>
                  <div>
                      <Label htmlFor="designer-select">Assign Designer</Label>
                      <Select onValueChange={setAssignedDesigner} value={assignedDesigner}>
                          <SelectTrigger id="designer-select">
                              <SelectValue placeholder="Select a designer" />
                          </SelectTrigger>
                          <SelectContent>
                              {designers.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleApproveRequest} disabled={isSubmitting || !assignedDesigner}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Approve & Create Project
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
