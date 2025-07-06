
"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
import { Progress } from "@/components/ui/progress"
import { v4 as uuidv4 } from 'uuid';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setIsUploading(true);
    setUploadProgress(0);

    const assetId = uuidv4();
    const fileExtension = fileToUpload.name.split('.').pop();
    const storageRef = ref(storage, `projects/${project.id}/${assetId}.${fileExtension}`);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "There was an error uploading your file." });
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        const newAsset: Asset = {
          id: assetId,
          name: fileToUpload.name,
          url: downloadURL,
          size: `${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`,
          fileType: fileToUpload.type || 'unknown',
          createdAt: new Date().toISOString(),
        };

        const projectRef = doc(db, "projects", project.id);
        await updateDoc(projectRef, {
          assets: arrayUnion(newAsset)
        });
        
        setIsUploading(false);
        setFileToUpload(null);
        setIsDeliverDialogOpen(false);
        toast({
            title: "Asset Delivered!",
            description: "The client can now access the new file in their portal.",
            action: <CheckCircle className="text-green-500" />,
        });
      }
    );
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
                    Upload a file to make it available to the client in their portal.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input type="file" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} />
                  {isUploading && (
                    <div className="space-y-2">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground text-center">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                  )}
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
