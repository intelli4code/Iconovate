

"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot, collection, query, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { supabase } from "@/lib/supabase"
import type { Project, Feedback, Asset, Task, Notification, InternalNote, TeamMember, Expense } from "@/types"
import { format, addDays } from 'date-fns';
import { generateTasksFromBrief } from "@/ai/flows/task-generator"

import { PageHeader } from "@/components/page-header"
import { ProjectTabs } from "@/components/projects/project-tabs"
import { Button, buttonVariants } from "@/components/ui/button"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, UploadCloud, Loader2, AlertTriangle, ShieldCheck, RefreshCw, XCircle, BrainCircuit, Info } from "lucide-react"
import Loading from "../../loading"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { v4 as uuidv4 } from 'uuid';
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<TeamMember | null>(null);

  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extraDays, setExtraDays] = useState(7);


  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    const docRef = doc(db, "projects", params.id);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() } as Project);
      } else {
        notFound();
      }
      setLoading(false);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
        if (authUser?.email) {
            const teamRef = collection(db, "teamMembers");
            const q = query(teamRef, where("email", "==", authUser.email));
            const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    setAdminUser({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as TeamMember);
                }
            });
            return () => unsubscribeSnapshot();
        } else {
            setAdminUser(null);
        }
    });

    return () => {
        unsubscribe();
        unsubscribeAuth();
    };
  }, [params.id]);


  const handleFileUpload = async () => {
    if (!supabase) {
      toast({ variant: "destructive", title: "Storage Not Configured", description: "File uploads are disabled. Please add Supabase credentials in your environment file." });
      return;
    }

    if (!selectedFile || !project) {
        toast({
            variant: "destructive",
            title: "No File Selected",
            description: "Please select a file to upload.",
        });
        return;
    }

    setIsSubmitting(true);

    try {
        const filePath = `${project.id}/${uuidv4()}-${selectedFile.name}`;
        
        const { data, error: uploadError } = await supabase.storage
            .from('main')
            .upload(filePath, selectedFile);

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from('main')
            .getPublicUrl(data.path);

        const newAsset: Asset = {
          id: uuidv4(),
          name: selectedFile.name,
          url: publicUrlData.publicUrl,
          path: data.path,
          size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
          fileType: selectedFile.type || 'file',
          createdAt: new Date().toISOString(),
        };

        const projectRef = doc(db, "projects", project.id);
        await updateDoc(projectRef, {
          assets: arrayUnion(newAsset)
        });
        
        toast({
            title: "Asset Delivered!",
            description: "The client can now download the new file in their portal.",
            action: <CheckCircle className="text-green-500" />,
        });

    } catch (error: any) {
        console.error("Supabase upload error:", error);
        toast({ 
            variant: "destructive", 
            title: "Upload Failed", 
            description: error.message || "An unknown error occurred. Please check your Supabase bucket policies and ensure 'main' exists and allows public uploads."
        });
    } finally {
        setIsSubmitting(false);
        setSelectedFile(null);
        setIsDeliverDialogOpen(false);
    }
  };

  const handleFileDelete = async (assetToDelete: Asset) => {
    if (!project) return;
     if (!supabase) {
      toast({ variant: "destructive", title: "Storage Not Configured", description: "File deletion is disabled. Please add Supabase credentials in your environment file." });
      return;
    }
    try {
      // 1. Delete from Supabase Storage
      const { error: storageError } = await supabase.storage.from('main').remove([assetToDelete.path]);
      if (storageError) {
        throw storageError;
      }

      // 2. Delete from Firestore
      const projectRef = doc(db, "projects", project.id);
      const updatedAssets = project.assets.filter(asset => asset.id !== assetToDelete.id);
      await updateDoc(projectRef, {
        assets: updatedAssets,
      });

      toast({
        title: "Asset Deleted",
        description: `"${assetToDelete.name}" has been successfully removed.`,
      });
    } catch (error: any) {
      console.error("Error deleting asset:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Could not delete the asset. Please try again.",
      });
    }
  };
  
  const handleCompleteProject = async () => {
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { status: 'Completed' });

    toast({
      title: "Project Marked as Complete!",
      description: `${project.name} has been completed and the client notified.`,
      action: <CheckCircle className="text-green-500" />,
    });
  }

  const handleTaskToggle = async (taskId: string) => {
    if (!project) return;
    const newTasks = project.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { tasks: newTasks });
  }

  const handleTaskDelete = async (taskId: string) => {
    if (!project) return;
    try {
      const updatedTasks = project.tasks.filter(task => task.id !== taskId);
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, {
        tasks: updatedTasks,
      });

      toast({
        title: "Task Deleted",
        description: "The task has been removed from the project.",
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Could not delete the task. Please try again.",
      });
    }
  };

  const handleFeedbackSubmit = async (comment: string, file?: any) => {
    if (!comment.trim() || !project) return;

    const newFeedback: Feedback = {
      user: 'Alex (Designer)',
      comment,
      timestamp: new Date().toISOString(),
      ...(file && { file }),
    };

    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      feedback: arrayUnion(newFeedback)
    });
  };

  const handleNewInternalNote = async (noteText: string) => {
    if (!noteText.trim() || !project || !adminUser) return;
    
    const newNote: InternalNote = {
      id: uuidv4(),
      authorId: adminUser.id,
      authorName: adminUser.name,
      note: noteText.trim(),
      timestamp: new Date().toISOString(),
    };

    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      internalNotes: arrayUnion(newNote)
    });
  };

  const handleNewExpense = async (description: string, amount: number) => {
    if (!description.trim() || amount <= 0 || !project) return;
    
    const newExpense: Expense = {
      id: uuidv4(),
      description: description.trim(),
      amount,
      date: new Date().toISOString(),
    };

    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      expenses: arrayUnion(newExpense)
    });

    toast({ title: "Expense Added", description: "The new expense has been logged for this project."});
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!project) return;
    try {
      const updatedExpenses = project.expenses?.filter(exp => exp.id !== expenseId) || [];
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, {
        expenses: updatedExpenses,
      });

      toast({ title: "Expense Deleted" });
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast({ variant: "destructive", title: "Deletion Failed"});
    }
  };


  const handleRevisionLimitChange = async (newLimit: number) => {
    if (!project) return;
    if (newLimit < project.revisionsUsed) {
      toast({
        variant: "destructive",
        title: "Invalid Revision Limit",
        description: "The new limit cannot be less than the number of revisions already used.",
      });
      return;
    }
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { revisionLimit: newLimit });
    toast({
      title: "Revisions Updated",
      description: `The revision limit has been set to ${newLimit}.`,
    });
  };

  const handleConfirmCancellation = async () => {
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { status: 'Canceled' });
    toast({
      title: "Project Canceled",
      description: `The project "${project.name}" has been canceled.`,
    });
  };

  const handleDenyCancellationRequest = async () => {
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { status: 'In Progress' });
    toast({
      title: "Cancellation Request Denied",
      description: `The project "${project.name}" has been moved back to "In Progress". The client has been notified.`,
    });
  };

  const handleApproveAndStartProject = async () => {
    if (!project || !project.briefDescription) return;
    setIsSubmitting(true);
    
    try {
        const aiTasks = await generateTasksFromBrief({ briefDescription: project.briefDescription });
        const newTasks: Task[] = aiTasks.tasks.map(task => ({
            id: uuidv4(),
            text: task.text,
            completed: false,
        }));
        
        const approvalNotification: Notification = {
            id: uuidv4(),
            text: `Project approved and started. An initial task list has been generated.`,
            timestamp: new Date().toISOString(),
        };

        const projectRef = doc(db, "projects", project.id);
        await updateDoc(projectRef, { 
            status: 'In Progress',
            tasks: arrayUnion(...newTasks),
            notifications: arrayUnion(approvalNotification)
        });

        toast({
            title: "Project Approved & Tasks Generated!",
            description: `The project has been moved to "In Progress" and an initial task list has been created.`,
            action: <BrainCircuit className="text-green-500" />,
        });

    } catch (error) {
        console.error("Error approving project or generating tasks:", error);
        toast({
            variant: "destructive",
            title: "Approval Failed",
            description: "Could not start the project or generate AI tasks. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleReaskForBrief = async () => {
    if (!project) return;
    
    const reaskNotification: Notification = {
      id: uuidv4(),
      text: 'The designer has requested more details for the project brief. Please update it in the "Project Brief" tab.',
      timestamp: new Date().toISOString(),
    };

    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      status: 'Awaiting Brief',
      notifications: arrayUnion(reaskNotification),
    });

    toast({
      title: "Brief Re-submission Requested",
      description: "The client has been notified to provide more details.",
    });
  }

  const handleApproveRevision = async () => {
    if (!project || !project.revisionRequestDetails) return;

    const newDueDate = addDays(new Date(project.dueDate), extraDays);
    
    const revisionTask: Task = {
      id: uuidv4(),
      text: `Client Revision: ${project.revisionRequestDetails}`,
      completed: false,
    };

    const approvalNotification: Notification = {
        id: uuidv4(),
        text: `Revision Approved. Deadline extended by ${extraDays} days. New task added: "${revisionTask.text}"`,
        timestamp: new Date().toISOString(),
    };

    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      status: 'In Progress',
      revisionsUsed: project.revisionsUsed + 1,
      dueDate: format(newDueDate, 'yyyy-MM-dd'),
      revisionRequestDetails: '',
      revisionRequestTimestamp: '',
      tasks: arrayUnion(revisionTask),
      notifications: arrayUnion(approvalNotification)
    });

    toast({
      title: "Revision Approved",
      description: `The project deadline has been extended by ${extraDays} days and a new task has been added.`,
    });
    setIsRevisionDialogOpen(false);
  };
  
  const handleDenyRevision = async () => {
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { 
      status: 'In Progress',
      revisionRequestDetails: '',
      revisionRequestTimestamp: '',
    });
    toast({
      title: "Revision Request Denied",
      description: `The project has been moved back to "In Progress". The client has been notified.`,
    });
  };


  if (loading || !project) {
    return <Loading />;
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
            <Dialog open={isDeliverDialogOpen} onOpenChange={setIsDeliverDialogOpen}>
              <DialogTrigger asChild>
                <Button>Deliver Asset</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deliver New Asset</DialogTitle>
                  <DialogDescription>
                    Upload a file directly. It will be stored securely and made available to your client.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="asset-file">File</Label>
                        <Input id="asset-file" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </div>
                    {selectedFile && (
                        <div className="text-sm text-muted-foreground">
                            <p>File: {selectedFile.name}</p>
                            <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeliverDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button onClick={handleFileUpload} disabled={isSubmitting || !selectedFile}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Upload & Deliver
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive">Cancel Project</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately mark the project as "Canceled". This action can be undone by manually changing the project status.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Go Back</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmCancellation} className={buttonVariants({ variant: "destructive" })}>
                    Yes, Cancel Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleCompleteProject} variant="secondary">Mark as Complete</Button>
          </div>
        }
      />
      {project.status === 'Cancellation Requested' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cancellation Requested</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row justify-between sm:items-center">
            The client has requested to cancel this project.
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button onClick={handleConfirmCancellation} variant="destructive" size="sm">Confirm Cancellation</Button>
              <Button onClick={handleDenyCancellationRequest} variant="outline" size="sm">Deny Request</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {project.status === 'Revision Requested' && (
        <Alert className="mb-4 border-yellow-500">
          <RefreshCw className="h-4 w-4" />
          <AlertTitle>Revision Requested</AlertTitle>
          <AlertDescription>
            <p className="mb-2"><strong>Client's Request:</strong> "{project.revisionRequestDetails}"</p>
            <div className="flex gap-2 mt-2">
              <Dialog open={isRevisionDialogOpen} onOpenChange={setIsRevisionDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm">Approve Revision</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Approve Revision</DialogTitle>
                        <DialogDescription>
                            Add extra days to the deadline for this revision. The client's request will be added as a new task.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="extra-days">Extra Days for Deadline</Label>
                        <Input id="extra-days" type="number" value={extraDays} onChange={(e) => setExtraDays(Number(e.target.value))} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRevisionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleApproveRevision}>Approve & Add Time</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button onClick={handleDenyRevision} variant="outline" size="sm">Deny Request</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {project.status === 'Pending Approval' && (
        <Card className="mb-4 border-cyan-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-500" />
              Client Brief Submitted - Ready for Approval
            </CardTitle>
            <CardDescription>
              Review the client's initial brief in the "Overview" tab and approve the project to begin work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
                <Button onClick={handleApproveAndStartProject} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BrainCircuit className="mr-2 h-4 w-4" />}
                    Approve & Generate Tasks
                </Button>
                <Button onClick={handleReaskForBrief} variant="outline">Re-ask for Brief</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <ProjectTabs 
        project={project}
        adminUser={adminUser}
        onTaskToggle={handleTaskToggle} 
        onNewMessage={handleFeedbackSubmit}
        onFileDelete={handleFileDelete}
        onRevisionLimitChange={handleRevisionLimitChange}
        onTaskDelete={handleTaskDelete}
        onNewInternalNote={handleNewInternalNote}
        onNewExpense={handleNewExpense}
        onDeleteExpense={handleDeleteExpense}
      />
      <Card className="mt-4">
        <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>A log of important project events and updates.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {project.notifications?.length > 0 ? (
                    [...project.notifications].reverse().map(notification => (
                        <div key={notification.id} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Info className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">{notification.text}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(notification.timestamp), 'PPpp')}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-6">No notifications yet.</p>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
