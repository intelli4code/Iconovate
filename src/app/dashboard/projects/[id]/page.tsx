
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
import { CheckCircle, UploadCloud, Loader2, LinkIcon } from "lucide-react"
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
  
  const [assetUrl, setAssetUrl] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [assetSize, setAssetSize] = useState('');


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
    if (!assetUrl || !assetName || !project) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a valid URL and a name for the asset.",
        });
        return;
    }

    setIsSubmitting(true);

    try {
        const newAsset: Asset = {
          id: uuidv4(),
          name: assetName,
          url: assetUrl,
          size: assetSize || 'N/A',
          fileType: assetType || 'link',
          createdAt: new Date().toISOString(),
        };

        const projectRef = doc(db, "projects", project.id);
        await updateDoc(projectRef, {
          assets: arrayUnion(newAsset)
        });
        
        toast({
            title: "Asset Delivered!",
            description: "The client can now access the new file link in their portal.",
            action: <CheckCircle className="text-green-500" />,
        });

    } catch (error) {
        console.error("File delivery failed", error);
        toast({ variant: "destructive", title: "Delivery Failed", description: "There was an error saving the asset link." });
    } finally {
        setIsSubmitting(false);
        setAssetUrl('');
        setAssetName('');
        setAssetType('');
        setAssetSize('');
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
                  <DialogTitle>Deliver New Asset via Link</DialogTitle>
                  <DialogDescription>
                    Paste a link to a file hosted on a service like Google Drive or Dropbox.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="asset-url">File URL</Label>
                        <Input id="asset-url" type="url" placeholder="https://..." value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="asset-name">File Name</Label>
                        <Input id="asset-name" type="text" placeholder="e.g., Final_Logo.zip" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="asset-type">File Type (Optional)</Label>
                            <Input id="asset-type" type="text" placeholder="e.g., ZIP" value={assetType} onChange={(e) => setAssetType(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="asset-size">File Size (Optional)</Label>
                            <Input id="asset-size" type="text" placeholder="e.g., 25 MB" value={assetSize} onChange={(e) => setAssetSize(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeliverDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button onClick={handleDeliverAsset} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                    Link & Deliver
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
