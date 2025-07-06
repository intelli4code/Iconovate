

"use client"

import * as React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Project, Asset, TeamMember, InternalNote, Expense } from "@/types"
import { Users, ListTodo, RefreshCw, Download, Trash2, Pencil, Star, Fingerprint, Info, Link2, Timer, NotebookPen, Receipt } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "../ui/label"
import { format } from "date-fns"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ProjectTabsProps {
  project: Project,
  adminUser: TeamMember | null,
  onTaskToggle: (taskId: string) => void;
  onNewMessage: (message: string, file?: any) => void;
  onFileDelete: (asset: Asset) => void;
  onRevisionLimitChange: (newLimit: number) => void;
  onTaskDelete: (taskId: string) => void;
  onNewInternalNote: (note: string) => void;
  onNewExpense: (description: string, amount: number) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function ProjectTabs({ 
    project, 
    adminUser, 
    onTaskToggle, 
    onNewMessage, 
    onFileDelete, 
    onRevisionLimitChange, 
    onTaskDelete, 
    onNewInternalNote,
    onNewExpense,
    onDeleteExpense
}: ProjectTabsProps) {
  const [newComment, setNewComment] = useState("");
  const [newInternalNote, setNewInternalNote] = useState("");
  const [isEditRevisionsOpen, setIsEditRevisionsOpen] = React.useState(false);
  const [newRevisionLimit, setNewRevisionLimit] = React.useState(project.revisionLimit);

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<number | string>("");
  
  const completedTasks = project.tasks?.filter(task => task.completed).length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalExpenses = project.expenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newComment.trim()){
        onNewMessage(newComment.trim());
        setNewComment("");
    }
  }

  const handleInternalNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInternalNote.trim()) {
      onNewInternalNote(newInternalNote.trim());
      setNewInternalNote("");
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseDescription && typeof expenseAmount === 'number' && expenseAmount > 0) {
        onNewExpense(expenseDescription, expenseAmount);
        setExpenseDescription("");
        setExpenseAmount("");
    }
  };


  const handleSaveRevisions = () => {
    onRevisionLimitChange(newRevisionLimit);
    setIsEditRevisionsOpen(false);
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="assets">Assets</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
        <TabsTrigger value="internal_notes">Internal Notes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="font-semibold mr-2">Client:</span>
                  <span>{project.client}</span>
                </div>
                <div className="flex items-center">
                  <Fingerprint className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="font-semibold mr-2">Order ID:</span>
                  <span className="font-mono text-xs bg-muted p-1 rounded-md">{project.id}</span>
                </div>
                 <div className="flex items-center">
                    <span className="font-semibold mr-2">Project Type:</span>
                    <Badge variant="secondary">{project.projectType}</Badge>
                </div>
                 <div className="flex items-start">
                    <Users className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                        <span className="font-semibold mr-2">Assigned Team:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {project.team.map((memberName) => (
                                <Badge key={memberName} variant="secondary">{memberName}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center">
                    <span className="font-semibold mr-2">Status:</span>
                    <Badge variant="outline">{project.status}</Badge>
                </div>
                <div className="flex items-center">
                    <span className="font-semibold mr-2">Due Date:</span>
                    <span>{project.dueDate}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Revisions:</span>
                    <span>{project.revisionsUsed} of {project.revisionLimit} used</span>
                    <Dialog open={isEditRevisionsOpen} onOpenChange={setIsEditRevisionsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xs">
                            <DialogHeader>
                                <DialogTitle>Edit Revision Limit</DialogTitle>
                                <DialogDescription>
                                    Set the total number of revisions for this project.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label htmlFor="revision-limit-input">Total Revisions</Label>
                                <Input 
                                    id="revision-limit-input"
                                    type="number"
                                    value={newRevisionLimit}
                                    onChange={(e) => setNewRevisionLimit(Number(e.target.value))}
                                    min={project.revisionsUsed}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditRevisionsOpen(false)}>Cancel</Button>
                                <Button onClick={handleSaveRevisions}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Client Brief</CardTitle>
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
      </TabsContent>
      
      <TabsContent value="tasks" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Checklist</CardTitle>
            <CardDescription>Internal checklist for project deliverables. Client-added tasks are also shown here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <Progress value={progressPercentage} className="h-2" />
                <span className="text-sm font-medium text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="space-y-3 pt-2">
                {project.tasks?.map((task) => {
                    const totalMinutes = task.loggedTime?.reduce((acc, log) => acc + log.minutes, 0) || 0;
                    return (
                        <div key={task.id} className="flex items-center space-x-3 rounded-md border p-3 group">
                            <Checkbox 
                              id={`task-${task.id}`} 
                              checked={task.completed} 
                              onCheckedChange={() => onTaskToggle(task.id)} 
                            />
                            <div className="flex-1">
                                <label 
                                htmlFor={`task-${task.id}`} 
                                className={cn(
                                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", 
                                    task.completed && "line-through text-muted-foreground"
                                )}
                                >
                                    {task.text}
                                </label>
                                {totalMinutes > 0 && (
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                        <Timer className="h-3 w-3 mr-1"/>
                                        <span>{totalMinutes} min logged</span>
                                    </div>
                                )}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the task: "{task.text}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onTaskDelete(task.id)} className={buttonVariants({ variant: "destructive" })}>
                                    Delete Task
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )
                })}
                 {(!project.tasks || project.tasks.length === 0) && (
                    <p className="text-center text-muted-foreground py-6">No tasks have been added for this project yet.</p>
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
                            <TableHead className="hidden md:table-cell">Size</TableHead>
                            <TableHead className="hidden md:table-cell">Date Added</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {project.assets?.map((asset: Asset) => (
                        <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge variant="secondary">{asset.fileType}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{asset.size}</TableCell>
                            <TableCell className="hidden md:table-cell">{format(new Date(asset.createdAt), 'PP')}</TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete "{asset.name}". This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => onFileDelete(asset)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={asset.url} download>
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                        {(!project.assets || project.assets.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    No assets have been delivered yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </TabsContent>

       <TabsContent value="expenses" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Expenses</CardTitle>
            <CardDescription>Track project-specific costs. These are not visible to the client.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExpenseSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-6 p-4 border rounded-lg bg-secondary/30">
                <div className="flex-1 w-full space-y-2">
                    <Label htmlFor="expense-desc">Description</Label>
                    <Input id="expense-desc" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} placeholder="e.g., Stock photo subscription" />
                </div>
                <div className="w-full sm:w-auto space-y-2">
                    <Label htmlFor="expense-amount">Amount ($)</Label>
                    <Input id="expense-amount" type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(Number(e.target.value))} placeholder="50.00" />
                </div>
                <Button type="submit" className="w-full sm:w-auto">Add Expense</Button>
            </form>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {project.expenses?.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>{format(new Date(expense.date), 'PP')}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                            <TableCell>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete the expense: "{expense.description}".</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDeleteExpense(expense.id)} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!project.expenses || project.expenses.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">No expenses logged for this project.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex justify-end font-bold text-lg mt-4 pr-4">
                Total Expenses: {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="feedback" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Client Feedback</CardTitle>
            <CardDescription>Review and address client comments on the project.</CardDescription>
          </CardHeader>
          <CardContent>
            {project.review && (
              <div className="mb-6 border-b pb-6">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">FINAL REVIEW</h3>
                <div className="flex items-center gap-1 my-2">
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
                <blockquote className="italic text-foreground border-l-2 pl-4 py-2 bg-secondary/30 rounded-r-md">
                    {project.review}
                </blockquote>
              </div>
            )}
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
              <Label htmlFor="new-comment" className="font-semibold">Add a comment or internal note</Label>
              <Textarea id="new-comment" placeholder="Type your message..." className="mt-2" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <Button className="mt-3" type="submit">Submit Comment</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="internal_notes" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
            <CardDescription>Private notes for your team. Not visible to the client.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 w-full pr-4">
              <div className="space-y-6">
                {project.internalNotes?.length > 0 ? project.internalNotes.map((note: InternalNote) => (
                  <div key={note.id} className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40`} data-ai-hint={'creative professional'} />
                      <AvatarFallback>{note.authorName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{note.authorName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(note.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 p-3 bg-secondary/50 rounded-lg whitespace-pre-wrap">
                        {note.note}
                      </div>
                    </div>
                  </div>
                )) : <p className="text-muted-foreground text-center py-10">No internal notes yet.</p>}
              </div>
            </ScrollArea>
            <form onSubmit={handleInternalNoteSubmit} className="mt-6 pt-6 border-t">
              <Label htmlFor="internal-note" className="font-semibold">Add an Internal Note</Label>
              <Textarea
                id="internal-note"
                placeholder="Type your private note here..."
                className="mt-2"
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
                disabled={!adminUser}
              />
              <Button className="mt-3" type="submit" disabled={!newInternalNote.trim() || !adminUser}>
                <NotebookPen className="mr-2 h-4 w-4" />
                Save Note
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  )
}
