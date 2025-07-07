
"use client"

import { useState, type FormEvent, useEffect, useRef } from "react"
import { notFound, useParams } from "next/navigation"
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot, collection, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid';

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, MessageSquare, CheckCircle, Clock, Info, Paperclip, RefreshCw, AlertTriangle, XCircle, Star, Mail, FileText, Upload, Link2, Loader2, ReceiptText, CreditCard, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Project, Feedback as FeedbackType, Task, Notification, Invoice, InvoiceStatus, Payment, PaymentStatus } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { differenceInDays, parseISO, format } from 'date-fns';
import Loading from "@/app/dashboard/loading"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
        if (!supabase) {
          toast({ variant: "destructive", title: "Storage Not Configured", description: "File uploads are disabled. Please configure Supabase credentials."});
          return;
        }
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const invoiceStatusStyles: { [key in InvoiceStatus]: string } = {
  'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300',
  'Sent': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
  'Paid': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
  'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300',
};

const paymentStatusStyles: { [key in PaymentStatus]: string } = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300',
  'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300',
};

export default function ClientPortalPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [briefDescription, setBriefDescription] = useState("");
  const [briefLinks, setBriefLinks] = useState("");
  const [revisionDetails, setRevisionDetails] = useState("");
  const { toast } = useToast();
  
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // State for new payment submission
  const [paymentAmount, setPaymentAmount] = useState<number | string>("");
  const [paymentReference, setPaymentReference] = useState("");


  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    const docRef = doc(db, "projects", params.id);

    const unsubscribeProject = onSnapshot(docRef, (docSnap) => {
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

    const invoicesRef = collection(db, "invoices");
    const qInvoices = query(invoicesRef, where("projectId", "==", params.id));
    const unsubscribeInvoices = onSnapshot(qInvoices, (querySnapshot) => {
        let invoicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
        invoicesData.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
        setInvoices(invoicesData);
    });
    
    const paymentsRef = collection(db, "payments");
    const qPayments = query(paymentsRef, where("projectId", "==", params.id), orderBy("requestedAt", "desc"));
    const unsubscribePayments = onSnapshot(qPayments, (snapshot) => {
        const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
        setPayments(paymentsData);
    });


    return () => {
        unsubscribeProject();
        unsubscribeInvoices();
        unsubscribePayments();
    };
  }, [params.id]);

  useEffect(() => {
    if (loading || !project) return;
    
    const shouldShowPrompt = !project.clientEmail && localStorage.getItem(`hideEmailPrompt-${project.id}`) !== 'true';
    if (shouldShowPrompt) {
        // Use a small delay to prevent layout shift from interrupting the user
        const timer = setTimeout(() => setIsEmailDialogOpen(true), 1500);
        return () => clearTimeout(timer);
    }
  }, [project, loading]);


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
  
  const handleEmailDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email address."});
        return;
    }
    const projectRef = doc(db, "projects", project.id);
    await updateDoc(projectRef, { clientEmail: email.trim() });
    toast({
      title: "Email Saved!",
      description: "Thank you! We will use this email for important updates.",
      action: <CheckCircle className="text-green-500" />,
    });
    setIsEmailDialogOpen(false);
  };

  const handleDontShowAgain = () => {
    if (!project) return;
    localStorage.setItem(`hideEmailPrompt-${project.id}`, 'true');
    setIsEmailDialogOpen(false);
    toast({
        title: "Preference Saved",
        description: "We won't ask for your email again on this device.",
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
  
  const handlePayInvoice = async (invoiceId: string) => {
    if (!invoiceId) return;

    const invoiceRef = doc(db, "invoices", invoiceId);
    try {
        await updateDoc(invoiceRef, { status: "Paid" });
        toast({
            title: "Payment Successful!",
            description: "Thank you for your payment. The invoice has been marked as paid.",
            action: <CheckCircle className="text-green-500" />
        });
        setIsInvoiceDialogOpen(false); // Close modal on success
    } catch (e) {
        toast({ variant: "destructive", title: "Payment Failed" });
    }
  };

  const handlePaymentRequestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!project || !paymentAmount || !paymentReference.trim()) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide both amount and a reference."});
        return;
    }

    const newPayment: Omit<Payment, 'id'> = {
        projectId: project.id,
        projectName: project.name,
        clientName: project.client,
        amount: Number(paymentAmount),
        reference: paymentReference.trim(),
        status: 'Pending',
        requestedAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, "payments"), newPayment);
        toast({
            title: "Payment Submitted!",
            description: "Your payment notification has been sent for approval.",
        });
        setPaymentAmount("");
        setPaymentReference("");
    } catch (error) {
         toast({ variant: "destructive", title: "Submission Failed" });
    }
  }


  const visibleInvoices = invoices.filter(inv => inv.status !== 'Draft');
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="brief" disabled={project.status !== 'Awaiting Brief'}>Project Brief</TabsTrigger>
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
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
              <TabsContent value="invoices" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoices</CardTitle>
                        <CardDescription>View and pay invoices for this project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {visibleInvoices.length > 0 ? (
                            <ul className="space-y-3">
                                {visibleInvoices.map(invoice => (
                                    <li key={invoice.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <ReceiptText className="h-5 w-5 text-primary"/>
                                            <div>
                                                <p className="font-semibold">{invoice.invoiceNumber} - {formatCurrency(invoice.total)}</p>
                                                <p className="text-sm text-muted-foreground">Due: {format(new Date(invoice.dueDate), 'PP')}</p>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={invoiceStatusStyles[invoice.status]}>{invoice.status}</Badge>
                                            <Button variant="outline" size="sm" onClick={() => { setSelectedInvoice(invoice); setIsInvoiceDialogOpen(true); }}>View</Button>
                                         </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No invoices have been issued for this project.</p>
                        )}
                    </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="payments" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>Notify us of a new payment or view your payment history.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Submit a Payment</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <form onSubmit={handlePaymentRequestSubmit} className="grid sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment-amount">Amount Paid</Label>
                                        <Input id="payment-amount" type="number" placeholder="100.00" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="payment-ref">Reference / Transaction ID</Label>
                                        <Input id="payment-ref" placeholder="e.g., Stripe ID, Bank Ref" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                                    </div>
                                    <div className="self-end">
                                        <Button type="submit" className="w-full"><Send className="mr-2 h-4 w-4"/>Submit for Approval</Button>
                                    </div>
                                </form>
                             </CardContent>
                        </Card>
                        <div>
                             <h4 className="font-medium mb-2">Submitted Payments</h4>
                             {payments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{formatCurrency(p.amount)}</TableCell>
                                                <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                                                <TableCell><Badge variant="outline" className={paymentStatusStyles[p.status]}>{p.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             ) : (
                                <p className="text-center text-muted-foreground py-6 border rounded-lg">No payments have been submitted for this project.</p>
                             )}
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
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
          </div>
        </div>
      </main>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Stay Updated</DialogTitle>
                <DialogDescription>Please provide your email to receive important project notifications.</DialogDescription>
            </DialogHeader>
            <form id="email-form" onSubmit={handleEmailDialogSubmit} className="space-y-3 pt-2">
                <Label htmlFor="client-email" className="sr-only">Your Email Address</Label>
                <Input id="client-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </form>
            <DialogFooter className="flex-row justify-between w-full sm:justify-between">
                <Button variant="ghost" onClick={handleDontShowAgain}>Don't show again</Button>
                <Button type="submit" form="email-form">Save Email</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Viewing invoice {selectedInvoice?.invoiceNumber}.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
             <div className="border rounded-lg p-6 space-y-6 bg-white text-black mt-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold font-headline text-primary">INVOICE</h2>
                        <p className="text-gray-500">Invoice #: {selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-lg">{selectedInvoice.fromName}</h3>
                        <p className="text-sm text-gray-500 whitespace-pre-line">{selectedInvoice.fromAddress}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-bold">Bill To</p>
                        <p>{selectedInvoice.toName}</p>
                        <p className="text-gray-500 text-sm whitespace-pre-line">{selectedInvoice.toAddress}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">Issue Date:</span> {selectedInvoice.issueDate}</p>
                        <p><span className="font-bold">Due Date:</span> {selectedInvoice.dueDate}</p>
                    </div>
                </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Subtotal</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedInvoice.subtotal)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Tax</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedInvoice.taxAmount)}</TableCell>
                    </TableRow>
                    <TableRow className="text-lg font-bold">
                        <TableCell colSpan={3} className="text-right">Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedInvoice.total)}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
              {selectedInvoice.notes && (
                <div>
                    <p className="font-bold">Notes</p>
                    <p className="text-sm text-gray-500">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedInvoice && ['Sent', 'Overdue'].includes(selectedInvoice.status) && (
                <Button onClick={() => handlePayInvoice(selectedInvoice.id)}>
                    <CreditCard className="mr-2 h-4 w-4" /> Pay with Stripe
                </Button>
            )}
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
