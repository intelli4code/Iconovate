
"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { supabase } from "@/lib/supabase"
import type { Project, Feedback, Asset } from "@/types"

import { PageHeader } from "@/components/page-header"
import { ProjectTabs } from "@/components/projects/project-tabs"
import { Button } from "@/components/ui/button"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, UploadCloud, Loader2, AlertTriangle, ShieldCheck } from "lucide-react"
import Loading from "../../loading"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { v4 as uuidv4 } from 'uuid';
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


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

    return () => unsubscribe();
  }, [params.id]);


  const handleFileUpload = async () => {
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
            .from('data-storage')
            .upload(filePath, selectedFile);

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from('data-storage')
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
            description: error.message || "An unknown error occurred. Please check your Supabase bucket policies and ensure 'data-storage' exists and allows public uploads."
        });
    } finally {
        setIsSubmitting(false);
        setSelectedFile(null);
        setIsDeliverDialogOpen(false);
    }
  };

  const handleFileDelete = async (assetToDelete: Asset) => {
    if (!project) return;
    try {
      // 1. Delete from Supabase Storage
      const { error: storageError } = await supabase.storage.from('data-storage').remove([assetToDelete.path]);
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

  const handleFeedbackSubmit = async (comment: string) => {
    if (!comment.trim() || !project) return;

    const newFeedback: Feedback = {
      user: 'Alex (Designer)', // Or get current user name
      comment,
      timestamp: new Date().toISOString(),
    };

    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      feedback: arrayUnion(newFeedback)
    });
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
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { status: 'In Progress' });
    toast({
      title: "Project Approved!",
      description: `The project has been moved to "In Progress".`,
    });
  }


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
      {project.status === 'Pending Approval' && (
        <Card className="mb-4 border-cyan-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-500" />
              Client Brief Submitted - Ready for Approval
            </CardTitle>
            <CardDescription>
              Review the client's initial brief and approve the project to begin work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-semibold">Brief Description</Label>
              <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md whitespace-pre-wrap">{project.briefDescription || 'No description provided.'}</p>
            </div>
             <div>
              <Label className="font-semibold">Links Provided</Label>
              <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md whitespace-pre-wrap">{project.briefLinks || 'No links provided.'}</p>
            </div>
            <Button onClick={handleApproveAndStartProject}>
              Approve & Start Project
            </Button>
          </CardContent>
        </Card>
      )}
      <ProjectTabs 
        project={project} 
        onTaskToggle={handleTaskToggle} 
        onNewMessage={handleFeedbackSubmit}
        onFileDelete={handleFileDelete}
        onRevisionLimitChange={handleRevisionLimitChange}
      />
    </div>
  )
}
