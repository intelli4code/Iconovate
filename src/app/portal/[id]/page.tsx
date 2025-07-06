
"use client"

import { useState, type FormEvent, useEffect } from "react"
import { notFound, useParams } from "next/navigation"
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { v4 as uuidv4 } from 'uuid';

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, MessageSquare, CheckCircle, Clock, Info, Paperclip, RefreshCw, AlertTriangle, XCircle, Star, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Project, Feedback as FeedbackType, Task } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { differenceInDays, parseISO } from 'date-fns';
import Loading from "@/app/dashboard/loading"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

function ClientChat({ feedback, onNewMessage }: { feedback: FeedbackType[], onNewMessage: (msg: string) => void }) {
  const [newMessage, setNewMessage] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onNewMessage(newMessage.trim())
      setNewMessage("")
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
                <p className={`text-sm mt-1 p-3 rounded-lg max-w-xs ${fb.user === 'Client' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {fb.comment}
                </p>
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
          <Button className="w-full" type="submit">
            <MessageSquare className="mr-2 h-4 w-4" /> Send
          </Button>
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
  const { toast } = useToast();

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

  if (loading || !project) {
    return <Loading />;
  }

  const handleFeedbackSubmit = async (comment: string) => {
    if (!comment.trim() || !project) return;
    const newFeedback: FeedbackType = {
      user: 'Client',
      comment,
      timestamp: new Date().toISOString(),
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

  const handleApproveProject = async () => {
    if (!project) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { status: 'Approved' });
    toast({
      title: "Project Approved!",
      description: `Thank you for your approval. Your designer has been notified.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const handleRequestRevision = async () => {
    if (!project || project.revisionsUsed >= project.revisionLimit) return;
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, {
        revisionsUsed: project.revisionsUsed + 1,
        status: 'Pending Feedback'
    });
    toast({
      title: "Revision Requested",
      description: `Your designer has been notified. You have ${project.revisionLimit - project.revisionsUsed - 1} revisions remaining.`,
    });
  };

  const handleRequestCancellation = async () => {
    if (!project) return;
    if (project.status === 'Completed' || project.status === 'Canceled' || project.status === 'Approved') return;
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

  const isFinalState = ['Approved', 'Completed', 'Canceled'].includes(project.status);
  const daysRemaining = differenceInDays(parseISO(project.dueDate), new Date());
  const revisionsRemaining = project.revisionLimit - project.revisionsUsed;
  const canRequestRevision = revisionsRemaining > 0 && !isFinalState;

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

            <Tabs defaultValue="deliverables" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
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
            </Tabs>

            {(project.status === 'Completed' || project.status === 'Approved') && (
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
                          project.status === 'Approved' && 'border-green-500 text-green-500 [&>svg]:!text-green-500',
                          project.status === 'Completed' && 'border-blue-500 text-blue-500 [&>svg]:!text-blue-500',
                      )}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Project {project.status}</AlertTitle>
                          <AlertDescription>
                            {project.status === 'Approved' && 'Thank you! Your final assets are being prepared.'}
                            {project.status === 'Completed' && 'This project is complete. Thank you for your business!'}
                            {project.status === 'Canceled' && 'This project has been canceled.'}
                          </AlertDescription>
                      </Alert>
                  ) : (
                      <Button onClick={handleApproveProject} className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve Final Project
                      </Button>
                  )}
                  {canRequestRevision ? (
                     <Button onClick={handleRequestRevision} variant="outline" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Request Revision
                    </Button>
                  ) : !isFinalState && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>No Revisions Remaining</AlertTitle>
                      <AlertDescription>
                        You have used all your revisions. Please approve the project or contact your designer.
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
