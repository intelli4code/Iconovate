
"use client"

import { useState, type FormEvent } from "react"
import { mockProjects } from "@/lib/data"
import { notFound, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, MessageSquare, CheckCircle, Clock, Info, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { Project, Feedback as FeedbackType } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { differenceInDays, parseISO } from 'date-fns';

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

export default function ClientPortalPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | undefined>(() => mockProjects.find((p) => p.id === params.id));
  const { toast } = useToast();

  if (!project) {
    notFound();
  }
  
  const [isApproved, setIsApproved] = useState(project.status === 'Approved' || project.status === 'Completed');

  const handleFeedbackSubmit = (comment: string) => {
    const newFeedback: FeedbackType = {
      user: 'Client',
      comment,
      timestamp: new Date().toISOString(),
    };
    
    setProject(prev => {
        if (!prev) return prev;
        return {
            ...prev,
            feedback: [...prev.feedback, newFeedback]
        };
    });
  };

  const handleApproveProject = () => {
    setIsApproved(true);
    setProject(prev => prev ? {...prev, status: 'Approved'} : prev);
    toast({
      title: "Project Approved!",
      description: `Thank you for your approval. Your designer has been notified.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const daysRemaining = differenceInDays(parseISO(project.dueDate), new Date());

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold font-headline text-primary">{project.name}</h1>
          <h2 className="text-muted-foreground text-sm">Client Portal</h2>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
                  <p className="text-muted-foreground">{daysRemaining > 0 ? `${daysRemaining} days` : 'Past due'}</p>
                </div>
                 <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-primary"/>
                  <h3 className="font-semibold">Project Approved</h3>
                  <p className="text-muted-foreground">{isApproved ? 'Yes' : 'Pending'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
                <CardDescription>Download your final assets here.</CardDescription>
              </CardHeader>
              <CardContent>
                {project.assets.length > 0 ? (
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
          </div>
          
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                  <CardTitle>Final Approval</CardTitle>
                  <CardDescription>Once you're happy, approve the project here.</CardDescription>
              </CardHeader>
              <CardContent>
                  {isApproved ? (
                      <div className="flex flex-col items-center gap-3 rounded-lg border bg-green-900/20 p-4 text-center">
                          <CheckCircle className="h-10 w-10 text-green-400" />
                          <h3 className="font-semibold text-green-400">Project Approved</h3>
                      </div>
                  ) : (
                      <Button onClick={handleApproveProject} className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve Final Project
                      </Button>
                  )}
              </CardContent>
            </Card>
            <ClientChat feedback={project.feedback} onNewMessage={handleFeedbackSubmit} />
          </div>
        </div>
      </main>
    </div>
  )
}
