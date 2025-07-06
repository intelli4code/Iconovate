
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
import { CheckCircle, UploadCloud, Loader2 } from "lucide-react"
import Loading from "../../loading"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { v4 as uuidv4 } from 'uuid';
import { Label } from "@/components/ui/label"

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
        
        const { data, error } = await supabase.storage
            .from('data-storage')
            .upload(filePath, selectedFile);

        if (error) {
            throw error;
        }

        const { data: publicUrlData } = supabase.storage
            .from('data-storage')
            .getPublicUrl(data.path);

        const newAsset: Asset = {
          id: uuidv4(),
          name: selectedFile.name,
          url: publicUrlData.publicUrl,
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

    } catch (error) {
        console.error("File upload failed", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "There was an error uploading the file. Check console for details." });
    } finally {
        setIsSubmitting(false);
        setSelectedFile(null);
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
      <ProjectTabs project={project} onTaskToggle={handleTaskToggle} onNewMessage={handleFeedbackSubmit} />
    </div>
  )
}
