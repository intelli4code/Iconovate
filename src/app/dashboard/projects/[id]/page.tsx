
"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, Feedback, Asset } from "@/types"

import { PageHeader } from "@/components/page-header"
import { ProjectTabs } from "@/components/projects/project-tabs"
import { Button } from "@/components/ui/button"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, UploadCloud, Loader2 } from "lucide-react"
import Loading from "../../loading"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { v4 as uuidv4 } from 'uuid';

const toDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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


  const handleDeliverAsset = async () => {
    if (!fileToUpload || !project) return;
    
    // Firestore documents have a 1MB size limit. Base64 encoding increases file size.
    // We'll check for a safe limit, e.g., 750KB.
    if (fileToUpload.size > 750 * 1024) { 
        toast({
            variant: "destructive",
            title: "File Too Large",
            description: "Please upload files smaller than 750KB to store them directly in the project.",
        });
        return;
    }

    setIsUploading(true);

    try {
        const dataUrl = await toDataURL(fileToUpload);
        
        const newAsset: Asset = {
          id: uuidv4(),
          name: fileToUpload.name,
          url: dataUrl,
          size: `${(fileToUpload.size / 1024).toFixed(2)} KB`,
          fileType: fileToUpload.type || 'unknown',
          createdAt: new Date().toISOString(),
        };

        const projectRef = doc(db, "projects", project.id);
        await updateDoc(projectRef, {
          assets: arrayUnion(newAsset)
        });
        
        toast({
            title: "Asset Delivered!",
            description: "The client can now access the new file in their portal.",
            action: <CheckCircle className="text-green-500" />,
        });

    } catch (error) {
        console.error("File delivery failed", error);
        toast({ variant: "destructive", title: "Delivery Failed", description: "There was an error processing your file." });
    } finally {
        setIsUploading(false);
        setFileToUpload(null);
        setIsDeliverDialogOpen(false);
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
                    Upload a file to make it available to the client. Max file size: 750KB.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input type="file" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeliverDialogOpen(false)} disabled={isUploading}>Cancel</Button>
                  <Button onClick={handleDeliverAsset} disabled={!fileToUpload || isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Upload & Deliver
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={handleCompleteProject} variant="secondary">Mark as Complete</Button>
          </div>
        }
      />
      <ProjectTabs project={project} onTaskToggle={handleTaskToggle} onNewMessage={handleFeedbackSubmit} />
    </div>
  )
}
