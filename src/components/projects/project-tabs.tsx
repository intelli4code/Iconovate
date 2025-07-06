"use client"

import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/types"
import { Download, FileText, Image as ImageIcon, Palette, Type, Users, ListTodo, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface ProjectTabsProps {
  project: Project,
  onTaskToggle: (taskId: string) => void;
}

export function ProjectTabs({ project, onTaskToggle }: ProjectTabsProps) {
  const mockups = [
    { src: 'https://placehold.co/600x400', alt: 'Business Card Mockup', hint: 'business card' },
    { src: 'https://placehold.co/600x400', alt: 'Website Mockup', hint: 'website design' },
    { src: 'https://placehold.co/600x400', alt: 'Signage Mockup', hint: 'office signage' },
    { src: 'https://placehold.co/600x400', alt: 'App Icon Mockup', hint: 'mobile app' },
    { src: 'https://placehold.co/600x400', alt: 'Merchandise Mockup', hint: 'tshirt branding' },
    { src: 'https://placehold.co/600x400', alt: 'Stationery Mockup', hint: 'letterhead design' },
  ]
  
  const completedTasks = project.tasks.filter(task => task.completed).length;
  const totalTasks = project.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="presentation">Logo Presentation</TabsTrigger>
        <TabsTrigger value="guidelines">Brand Guidelines</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Assigned Team: {project.team.join(', ')}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Client: {project.client}</span>
            </div>
            <div className="flex items-center">
                <span className="font-semibold mr-2">Status:</span>
                <Badge variant="outline">{project.status}</Badge>
            </div>
             <div className="flex items-center">
                <span className="font-semibold mr-2">Due Date:</span>
                <span>{project.dueDate}</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="tasks" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Checklist</CardTitle>
            <CardDescription>Internal checklist for project deliverables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <Progress value={progressPercentage} className="h-2" />
                <span className="text-sm font-medium text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="space-y-3 pt-2">
                {project.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 rounded-md border p-3">
                        <Checkbox 
                          id={`task-${task.id}`} 
                          checked={task.completed} 
                          onCheckedChange={() => onTaskToggle(task.id)} 
                        />
                        <label 
                          htmlFor={`task-${task.id}`} 
                          className={cn(
                            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", 
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                            {task.text}
                        </label>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="presentation" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Logo Presentation Mockups</CardTitle>
            <CardDescription>Visualizing the new brand identity in various contexts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockups.map((mockup, index) => (
                <div key={index} className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image src={mockup.src} alt={mockup.alt} layout="fill" objectFit="cover" data-ai-hint={mockup.hint} />
                </div>
              ))}
            </div>
            <Button className="mt-6">
              <Download className="mr-2 h-4 w-4" /> Export as PDF
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="guidelines" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Brand Identity Guidelines</CardTitle>
            <CardDescription>The comprehensive rulebook for the new brand identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="flex items-center text-lg font-semibold font-headline mb-2"><FileText className="mr-2 h-5 w-5" />Logo Usage</h3>
              <p className="text-muted-foreground">Rules for clear space, minimum size, and correct application.</p>
            </section>
            <section>
              <h3 className="flex items-center text-lg font-semibold font-headline mb-2"><Palette className="mr-2 h-5 w-5" />Color Palette</h3>
              <p className="text-muted-foreground">Primary and secondary colors with HEX, RGB, and CMYK values.</p>
            </section>
            <section>
              <h3 className="flex items-center text-lg font-semibold font-headline mb-2"><Type className="mr-2 h-5 w-5" />Typography</h3>
              <p className="text-muted-foreground">Specifications for headlines, body text, and other typographic elements.</p>
            </section>
             <section>
              <h3 className="flex items-center text-lg font-semibold font-headline mb-2"><ImageIcon className="mr-2 h-5 w-5" />Imagery Style</h3>
              <p className="text-muted-foreground">Guidelines for photography and illustration to ensure brand consistency.</p>
            </section>
            <Button className="mt-6">
              <Download className="mr-2 h-4 w-4" /> Download Full Guidelines (PDF)
            </Button>
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
            <ScrollArea className="h-72 w-full pr-4">
              <div className="space-y-6">
                {project.feedback.length > 0 ? project.feedback.map((fb, index) => (
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
                      <p className="text-sm text-muted-foreground mt-1 p-3 bg-secondary/50 rounded-lg">{fb.comment}</p>
                    </div>
                  </div>
                )) : <p className="text-muted-foreground text-center py-10">No feedback yet.</p>}
              </div>
            </ScrollArea>
            <div className="mt-6 pt-6 border-t">
              <Label htmlFor="new-comment" className="font-semibold">Add a comment or internal note</Label>
              <Textarea id="new-comment" placeholder="Type your message..." className="mt-2" />
              <Button className="mt-3">Submit Comment</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
