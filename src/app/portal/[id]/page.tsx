
"use client"

import { useState, type FormEvent, useEffect, useRef } from "react"
import { notFound, useParams } from "next/navigation"
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid';

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, MessageSquare, CheckCircle, Clock, Info, Paperclip, RefreshCw, AlertTriangle, XCircle, Star, Mail, FileText, Upload, Link2, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Project, Feedback as FeedbackType, Task, Notification } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { differenceInDays, parseISO, format } from 'date-fns';
import Loading from "@/app/dashboard/loading"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

function ClientChat({ feedback, onNewMessage }: { feedback: FeedbackType[], onNewMessage: (msg: string, file?: any) => void }) {
  const [newMessage, setNewMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return;

    if (selectedFile) {
        setIsUploading(true);
        try {
            if (selectedFile.size > 200 * 1024 * 1024) { // 200MB limit
                toast({ variant: "destructive", title: "File Too Large", description: "The maximum file size is 200MB."});
                throw new Error("File too large");
            }
            const filePath = `chat-uploads/${uuidv4()}-${selectedFile.name}`;
            const { data, error: uploadError } = await supabase.storage.from('data-storage').upload(filePath, selectedFile);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('data-storage').getPublicUrl(data.path);

            const fileData = {
                name: selectedFile.name,
                url: publicUrlData.publicUrl,
                path: data.path,
                size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
                fileType: selectedFile.type,
            };

            onNewMessage(newMessage.trim(), fileData);

        } catch (error: any) {
            console.error("Chat upload error:", error);
            toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Could not upload your file."});
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
            setNewMessage("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    } else {
        onNewMessage(newMessage.trim());
        setNewMessage("");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Chat</CardTitle>
        <CardDescription>Communicate with your designer directly.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-[400px] overflow-y-auto pr-2 mb-4 border-b pb-4">
          {feedback.map((fb, index) => (
            <div key={index} className={`flex items-start gap-3 ${fb.user === 'Client' ? 'justify-end' : ''}`}>
              {fb.user !== 'Client' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://placehold.co/40x40`} data-ai-hint={'creative professional'} />
                  <AvatarFallback>{fb.user.substring(0, 2)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${fb.user === 'Client' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 ${fb.user === 'Client' ? 'flex-row-reverse' : ''}`}>
                  <p className="font-semibold text-sm">{fb.user}</p>
                  <p className="text-xs text-muted-foreground">{new Date(fb.timestamp).toLocaleDateString()}</p>
                </div>
                <div className={`text-sm mt-1 p-3 rounded-lg max-w-xs ${fb.user === 'Client' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {fb.comment && <p>{fb.comment}</p>}
                  {fb.file && (
                    <a href={fb.file.url} download={fb.file.name} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'secondary', size: 'sm'}), 'mt-2')}>
                      <Link2 className="mr-2 h-4 w-4" /> {fb.file.name}
                    </a>
                  )}
                </div>
              </div>
              {fb.user === 'Client' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://placehold.co/40x40`} data-ai-hint={'business person'} />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {feedback.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Start the conversation!</p>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Label htmlFor="client-comment" className="font-semibold">Your Message</Label>
          <Textarea id="client-comment" placeholder="Type your message here..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          {selectedFile && <p className="text-sm text-muted-foreground">Attached: {selectedFile.name}</p>}
          <div className="flex justify-between items-center">
            <div>
                 <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4"/>
                    <span className="sr-only">Upload File</span>
                </Button>
                <Input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </div>
            <Button className="w-auto" type="submit" disabled={isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquare className="mr-2 h-4 w-4" />}
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ClientReview({
  project,
  onReviewSubmit,
}: {
  project: Project
  onReviewSubmit: (rating: number, review: string) => void
}) {
  const [rating, setRating] = useState(project.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(project.review || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && reviewText.trim()) {
      onReviewSubmit(rating, reviewText.trim());
    }
  };

  if (project.review && project.rating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
          <CardDescription>Thank you for your feedback!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-5 w-5',
                  (project.rating || 0) > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
          <p className="text-muted-foreground italic">"{project.review}"</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>Your feedback helps us improve.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Your Rating</Label>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      'h-6 w-6 cursor-pointer transition-colors',
                      (hoverRating || rating) > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-text">Your Review</Label>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
            />
          </div>
          <Button type="submit" disabled={!rating || !reviewText.trim()}>
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EmailCollection({ project, onEmailSubmit }: { project: Project, onEmailSubmit: (email: string) => void }) {
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
            onEmailSubmit(email.trim());
        }
    }

    if (project.clientEmail) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Email on File
                    </CardTitle>
                    <CardDescription>We'll use this email for important project notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold text-foreground">{project.clientEmail}</p>
                    <p className="text-sm text-muted-foreground mt-1">Thank you for providing your contact information.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                     <Mail className="h-5 w-5 text-primary" />
                     Stay Updated
                </CardTitle>
                <CardDescription>Please provide your email address to receive important project notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Label htmlFor="client-email">Your Email Address</Label>
                    <Input id="client-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Button type="submit" className="w-full">Save Email</Button>
                </form>
            </CardContent>
        </Card>
    )
}


export default function ClientPortalPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [briefDescription, setBriefDescription] = useState("");
  const [briefLinks, setBriefLinks] = useState("");
  const [revisionDetails, setRevisionDetails] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    const docRef = doc(db, "projects", params.id);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const projectData = { id: docSnap.id, ...docSnap.data() } as Project
        setProject(projectData);
        setBriefDescription(projectData.briefDescription || "");
        setBriefLinks(projectData.briefLinks || "");
      } else {
        notFound();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id]);

  if (loading || !project) {
    return <Loading />;
  }

  const handleFeedbackSubmit = async (comment: string, file?: any) => {
    if (!comment.trim() && !file) return;

    const newFeedback: FeedbackType = {
      user: 'Client',
      comment,
      timestamp: new Date().toISOString(),
      ...(file && { file }),
    };
    
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
        feedback: arrayUnion(newFeedback)
    });
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !project) return;
    
    const task: Task = {
        id: uuidv4(),
        text: `Client Request: ${newTask.trim()}`,
        completed: false,
    };
    
    const projectRef = doc(db, "projects", project.id);
    try {
        await updateDoc(projectRef, {
            tasks: arrayUnion(task)
        });
        setNewTask("");
        toast({
            title: "Task Added",
            description: "Your designer has been notified of the new task.",
        });
    } catch (error) {
        console.error("Error adding task:", error);
        toast({
            variant: "destructive",
            title: "Failed to Add Task",
            description: "Could not add the task. Please try again.",
        });
    }
  };

  const handleCompleteProject = async () => {
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { status: 'Completed' });
    toast({
      title: "Project Completed!",
      description: `Thank you for confirming completion. We appreciate your business!`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const handleConfirmRevisionRequest = async () => {
    if (!project || !revisionDetails.trim()) {
      toast({
        variant: "destructive",
        title: "Details Required",
        description: "Please describe the revisions you need.",
      });
      return;
    }
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
        status: 'Revision Requested',
        revisionRequestDetails: revisionDetails,
        revisionRequestTimestamp: new Date().toISOString(),
    });
    setRevisionDetails("");
    toast({
      title: "Revision Requested",
      description: "Your revision request has been sent to the designer for approval.",
    });
  };

  const handleRequestCancellation = async () => {
    if (!project) return;
    if (project.status === 'Completed' || project.status === 'Canceled') return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { status: 'Cancellation Requested' });
    toast({
        title: "Cancellation Requested",
        description: "Your cancellation request has been sent to the designer for review.",
    });
  };

  const handleReviewSubmit = async (rating: number, review: string) => {
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      rating: rating,
      review: review,
    });
    toast({
      title: "Review Submitted!",
      description: "Thank you for your valuable feedback.",
      action: <CheckCircle className="text-green-500" />,
    });
  };
  
  const handleEmailSubmit = async (email: string) => {
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
      clientEmail: email,
    });
    toast({
      title: "Email Saved!",
      description: "Thank you! We will use this email for important updates.",
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const handleBriefSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!project || (!briefDescription.trim() && !briefLinks.trim())) {
        toast({
            variant: "destructive",
            title: "Brief is Empty",
            description: "Please provide a description or some links for your project.",
        });
        return;
    }

    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
        briefDescription: briefDescription,
        briefLinks: briefLinks,
        status: 'Pending Approval',
    });

    toast({
        title: "Brief Submitted!",
        description: "Your project brief has been sent to the designer for approval.",
    });
  };

  const isFinalState = ['Completed', 'Canceled'].includes(project.status);
  const daysRemaining = differenceInDays(parseISO(project.dueDate), new Date());
  const revisionsRemaining = project.revisionLimit - project.revisionsUsed;
  const canRequestRevision = revisionsRemaining > 0 && !isFinalState && project.status !== 'Revision Requested';
  const canCompleteProject = project.assets && project.assets.length > 0 && !isFinalState;
  const defaultTab = project.status === 'Awaiting Brief' ? 'brief' : 'deliverables';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold font-headline text-primary">{project.name}</h1>
          <h2 className="text-muted-foreground text-sm">Client Portal</h2>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {project.status === 'Cancellation Requested' && (
             <Alert className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Cancellation Pending</AlertTitle>
              <AlertDescription>
                Your request to cancel this project is currently being reviewed by the designer.
              </AlertDescription>
            </Alert>
        )}
        {project.status === 'Revision Requested' && (
             <Alert className="mb-8 border-yellow-500">
              <RefreshCw className="h-4 w-4" />
              <AlertTitle>Revision Request Pending</AlertTitle>
              <AlertDescription>
                Your request for a revision is currently being reviewed by the designer.
              </AlertDescription>
            </Alert>
        )}
        {project.status === 'Awaiting Brief' && (
             <Alert variant="default" className="mb-8 border-primary">
              <FileText className="h-4 w-4" />
              <AlertTitle>Action Required: Submit Your Project Brief</AlertTitle>
              <AlertDescription>
                Please provide the initial details for your project in the "Project Brief" tab below to get started.
              </AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Info className="h-8 w-8 text-primary"/>
                  <h3 className="font-semibold">Status</h3>
                  <Badge variant={project.status === 'Completed' ? 'default' : 'secondary'}>{project.status}</Badge>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Clock className="h-8 w-8 text-primary"/>
                  <h3 className="font-semibold">Time Remaining</h3>
                  <p className="text-muted-foreground">{daysRemaining >= 0 ? `${daysRemaining} days` : 'Past due'}</p>
                </div>
                 <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 text-primary"/>
                  <h3 className="font-semibold">Revisions Left</h3>
                  <p className="text-muted-foreground">{revisionsRemaining} of {project.revisionLimit}</p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="brief" disabled={project.status !== 'Awaiting Brief'}>Project Brief</TabsTrigger>
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
               <TabsContent value="brief" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Initial Project Brief</CardTitle>
                        <CardDescription>Provide your designer with the necessary files, links, and descriptions to start the project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <form onSubmit={handleBriefSubmit} className="space-y-4">
                           <div>
                               <Label htmlFor="brief-description">Project Description & Requirements</Label>
                               <Textarea 
                                   id="brief-description" 
                                   rows={6}
                                   placeholder="Describe your project, goals, target audience, and any other important details..."
                                   value={briefDescription}
                                   onChange={(e) => setBriefDescription(e.target.value)}
                                />
                           </div>
                           <div>
                               <Label htmlFor="brief-links">Relevant Links (optional, one per line)</Label>
                               <Textarea 
                                   id="brief-links"
                                   rows={4}
                                   placeholder="e.g., https://your-company.com\nhttps://inspiration-site.com"
                                   value={briefLinks}
                                   onChange={(e) => setBriefLinks(e.target.value)}
                                />
                           </div>
                           <Button type="submit">Submit Brief for Approval</Button>
                       </form>
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="deliverables" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Deliverables</CardTitle>
                        <CardDescription>Download your final assets here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {project.assets && project.assets.length > 0 ? (
                        <ul className="space-y-3">
                            {project.assets.map(asset => (
                            <li key={asset.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                <div className="flex items-center gap-3">
                                <Paperclip className="h-5 w-5"/>
                                <div>
                                    <p className="font-semibold">{asset.name}</p>
                                    <p className="text-sm text-muted-foreground">{asset.size}</p>
                                </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                <a href={asset.url} download><Download className="mr-2 h-4 w-4" />Download</a>
                                </Button>
                            </li>
                            ))}
                        </ul>
                        ) : (
                        <p className="text-center text-muted-foreground py-6">No assets have been delivered yet.</p>
                        )}
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tasks" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Tasks</CardTitle>
                        <CardDescription>View the project timeline and add new requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {project.tasks.map(task => (
                                <div key={task.id} className="flex items-center space-x-3 rounded-md border p-3 bg-muted/50">
                                    {task.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-yellow-500" />}
                                    <p className={cn("text-sm flex-1", task.completed && "line-through text-muted-foreground")}>
                                        {task.text}
                                    </p>
                                </div>
                            ))}
                             {project.tasks.length === 0 && <p className="text-center text-muted-foreground py-4">No tasks yet.</p>}
                        </div>
                        <form onSubmit={handleAddTask} className="mt-6 pt-6 border-t">
                            <Label htmlFor="new-task">Add a New Task or Request</Label>
                            <div className="flex gap-2 mt-2">
                                <Input 
                                  id="new-task" 
                                  value={newTask} 
                                  onChange={(e) => setNewTask(e.target.value)} 
                                  placeholder="e.g., 'Please provide a version in all black'" 
                                />
                                <Button type="submit" disabled={!newTask.trim()}>Add Task</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="notifications" className="mt-4">
                <Card>
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
              </TabsContent>
            </Tabs>

            {project.status === 'Completed' && (
              <ClientReview project={project} onReviewSubmit={handleReviewSubmit} />
            )}

          </div>
          
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                  <CardTitle>Project Actions</CardTitle>
                  <CardDescription>Manage project milestones from here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {isFinalState ? (
                      <Alert className={cn(
                          project.status === 'Completed' && 'border-green-500 text-green-500 [&>svg]:!text-green-500',
                          project.status === 'Canceled' && 'border-destructive text-destructive [&>svg]:!text-destructive'
                      )}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Project {project.status}</AlertTitle>
                          <AlertDescription>
                            {project.status === 'Completed' && 'This project is complete. Thank you for your business!'}
                            {project.status === 'Canceled' && 'This project has been canceled.'}
                          </AlertDescription>
                      </Alert>
                  ) : canCompleteProject ? (
                      <Button onClick={handleCompleteProject} className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark Project as Complete
                      </Button>
                  ) : (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Awaiting Deliverables</AlertTitle>
                        <AlertDescription>The completion button will appear here once your designer has uploaded the final assets.</AlertDescription>
                    </Alert>
                  )}
                  
                  {canRequestRevision ? (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" /> Request Revision
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Request a Revision</AlertDialogTitle>
                            <AlertDialogDescription>
                              Please describe the changes you would like to request. This will use one of your remaining revisions and will be sent to the designer for approval.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-2">
                            <Label htmlFor="revision-details" className="sr-only">Revision Details</Label>
                            <Textarea 
                                id="revision-details"
                                placeholder="e.g., 'Please change the primary color to a darker shade of blue and make the logo slightly larger.'"
                                value={revisionDetails}
                                onChange={(e) => setRevisionDetails(e.target.value)}
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmRevisionRequest} disabled={!revisionDetails.trim()}>
                              Submit Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  ) : !isFinalState && (
                    <Alert variant={project.status === 'Revision Requested' ? 'default' : 'destructive'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>
                        {project.status === 'Revision Requested' ? 'Revision Pending Approval' : 'No Revisions Remaining'}
                      </AlertTitle>
                      <AlertDescription>
                        {project.status === 'Revision Requested' 
                            ? 'Your request is being reviewed.' 
                            : 'Please contact your designer for further changes.'
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="w-full" disabled={isFinalState || project.status === 'Cancellation Requested'}>
                          <XCircle className="mr-2 h-4 w-4" /> Request Cancellation
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will send a cancellation request to your designer. They will have to approve it before the project is officially canceled.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Go Back</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleRequestCancellation} 
                            className={buttonVariants({ variant: "destructive" })}
                          >
                            Yes, Request Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
              </CardContent>
            </Card>
            <ClientChat feedback={project.feedback} onNewMessage={handleFeedbackSubmit} />
            <EmailCollection project={project} onEmailSubmit={handleEmailSubmit} />
          </div>
        </div>
      </main>
    </div>
  )
}
