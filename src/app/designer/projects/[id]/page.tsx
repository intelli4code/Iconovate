"use client"

import { useState, useEffect, type FormEvent } from "react"
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { supabase } from "@/lib/supabase"
import type { Project, Feedback, Asset, Task } from "@/types"
import { notFound, useParams } from "next/navigation"
import { v4 as uuidv4 } from 'uuid';

import { PageHeader } from "@/components/page-header"
import Loading from "@/app/dashboard/loading"
import { useToast } from "@/hooks/use-toast"
import { Button, buttonVariants } from "@/components/ui/button"
import { UploadCloud, Loader2, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Info, Link2 } from "lucide-react"
import { format } from 'date-fns';

function DesignerProjectTabs({
    project,
    onTaskToggle,
    onNewMessage,
}: {
    project: Project;
    onTaskToggle: (taskId: string) => void;
    onNewMessage: (message: string, file?: any) => void;
}) {
    const [newComment, setNewComment] = useState("");
    const completedTasks = project.tasks?.filter((task) => task.completed).length || 0;
    const totalTasks = project.tasks?.length || 0;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onNewMessage(newComment.trim());
            setNewComment("");
        }
    };

    return (
        <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Task Checklist</CardTitle>
                        <CardDescription>Your checklist for project deliverables. Client-added tasks are also shown here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Progress value={progressPercentage} className="h-2" />
                            <span className="text-sm font-medium text-muted-foreground">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="space-y-3 pt-2">
                            {project.tasks?.map((task) => (
                                <div key={task.id} className="flex items-center space-x-3 rounded-md border p-3 group">
                                    <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => onTaskToggle(task.id)} />
                                    <label htmlFor={`task-${task.id}`} className={cn("text-sm font-medium leading-none flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70", task.completed && "line-through text-muted-foreground")}>
                                        {task.text}
                                    </label>
                                </div>
                            ))}
                            {(!project.tasks || project.tasks.length === 0) && (
                                <p className="text-center text-muted-foreground py-6">No tasks for this project yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="assets" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Assets</CardTitle>
                        <CardDescription>All final and deliverable assets for this project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {project.assets?.map((asset: Asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">{asset.name}</TableCell>
                                        <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{asset.fileType}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={asset.url} download><Download className="h-4 w-4" /></a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!project.assets || project.assets.length === 0) && (
                                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No assets have been delivered yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="feedback" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Chat</CardTitle>
                        <CardDescription>Communicate with the client and other stakeholders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72 w-full pr-4">
                            <div className="space-y-6">
                                {project.feedback?.length > 0 ? project.feedback.map((fb, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarImage src={`https://placehold.co/40x40`} data-ai-hint={fb.user === 'Client' ? 'business person' : 'creative professional'} />
                                            <AvatarFallback>{fb.user.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold">{fb.user}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(fb.timestamp).toLocaleString()}</p>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1 p-3 bg-secondary/50 rounded-lg">
                                                {fb.comment && <p>{fb.comment}</p>}
                                                {fb.file && (
                                                    <a href={fb.file.url} download={fb.file.name} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline', size: 'sm'}), 'mt-2')}>
                                                        <Link2 className="mr-2 h-4 w-4" /> {fb.file.name}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-muted-foreground text-center py-10">No feedback yet.</p>}
                            </div>
                        </ScrollArea>
                        <form onSubmit={handleCommentSubmit} className="mt-6 pt-6 border-t">
                            <Label htmlFor="new-comment" className="font-semibold">Add a comment</Label>
                            <Textarea id="new-comment" placeholder="Type your message..." className="mt-2" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                            <Button className="mt-3" type="submit">Submit Comment</Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

export default function DesignerProjectPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  
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
        toast({ variant: "destructive", title: "No File Selected" });
        return;
    }
    setIsSubmitting(true);
    try {
        const filePath = `${project.id}/${uuidv4()}-${selectedFile.name}`;
        const { data, error: uploadError } = await supabase.storage.from('data-storage').upload(filePath, selectedFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('data-storage').getPublicUrl(data.path);

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
        await updateDoc(projectRef, { assets: arrayUnion(newAsset) });
        
        toast({ title: "Asset Delivered!", description: "The client can now download the new file.", action: <CheckCircle className="text-green-500" /> });
    } catch (error: any) {
        console.error("Supabase upload error:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
        setIsSubmitting(false);
        setSelectedFile(null);
        setIsDeliverDialogOpen(false);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    if (!project) return;
    const newTasks = project.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { tasks: newTasks });
  };

  const handleFeedbackSubmit = async (comment: string) => {
    if (!comment.trim() || !project) return;
    const newFeedback: Feedback = {
      user: 'Designer', 
      comment,
      timestamp: new Date().toISOString(),
    };
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { feedback: arrayUnion(newFeedback) });
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
                    <Dialog open={isDeliverDialogOpen} onOpenChange={setIsDeliverDialogOpen}>
                        <DialogTrigger asChild><Button>Deliver Asset</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Deliver New Asset</DialogTitle>
                                <DialogDescription>Upload a file directly. It will be stored securely and made available to your client.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div>
                                    <Label htmlFor="asset-file">File</Label>
                                    <Input id="asset-file" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                </div>
                                {selectedFile && <div className="text-sm text-muted-foreground"><p>File: {selectedFile.name}</p><p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p></div>}
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
                </div>
            }
        />

        <Card>
            <CardHeader>
                <CardTitle>Project Brief</CardTitle>
                <CardDescription>The initial requirements and links provided by the client.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {project.briefDescription || project.briefLinks ? (
                    <>
                        {project.briefDescription && (
                            <div>
                                <Label className="font-semibold">Description & Requirements</Label>
                                <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md whitespace-pre-wrap mt-1">{project.briefDescription}</p>
                            </div>
                        )}
                        {project.briefLinks && (
                            <div>
                                <Label className="font-semibold">Provided Links</Label>
                                <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md whitespace-pre-wrap mt-1">{project.briefLinks}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-muted-foreground py-6">
                        <p>The client has not submitted a brief for this project yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <DesignerProjectTabs
            project={project}
            onTaskToggle={handleTaskToggle}
            onNewMessage={handleFeedbackSubmit}
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
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><Info className="h-4 w-4" /></div>
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
