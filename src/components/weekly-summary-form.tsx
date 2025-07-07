
"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateWeeklySummary, type WeeklySummaryOutput } from '@/ai/flows/weekly-summary-generator';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project } from '@/types';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, CalendarClock, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const FormSchema = z.object({
  projectId: z.string().min(1, "Please select a project."),
  nextSteps: z.string().min(10, { message: 'Please describe the next steps.' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function WeeklySummaryForm() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [result, setResult] = useState<WeeklySummaryOutput | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });
  
  const selectedProjectId = watch('projectId');

  useEffect(() => {
    setLoadingProjects(true);
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const projectsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Project[];
        setProjects(projectsData);
        setLoadingProjects(false);
    }, (error) => {
        console.error("Error fetching projects: ", error);
        setLoadingProjects(false);
        toast({ variant: "destructive", title: "Failed to load projects" });
    });

    return () => unsubscribe();
  }, [toast]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const selectedProject = projects.find(p => p.id === data.projectId);
    if (!selectedProject) {
        toast({ variant: 'destructive', title: 'Project not found' });
        return;
    }

    setLoading(true);
    setResult(null);

    const completedTasks = selectedProject.tasks
        .filter(t => t.completed)
        .map(t => `- ${t.text}`)
        .join('\n');

    try {
      const response = await generateWeeklySummary({
          projectName: selectedProject.name,
          clientName: selectedProject.client,
          completedTasks: completedTasks || "No tasks marked as completed this week.",
          nextSteps: data.nextSteps
      });
      setResult(response);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the summary. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.summaryEmail) return;
    navigator.clipboard.writeText(result.summaryEmail);
    toast({
      title: "Copied to clipboard!",
      description: `The summary email is now in your clipboard.`,
    });
  };

  const projectDetails = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Summary Inputs</CardTitle>
          <CardDescription>Select a project and describe the plan for next week.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Select Project</Label>
              <Select onValueChange={(value) => setValue('projectId', value, { shouldValidate: true })} disabled={loadingProjects}>
                  <SelectTrigger>
                      <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Choose a project"} />
                  </SelectTrigger>
                  <SelectContent>
                      {projects.map(project => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}
                  </SelectContent>
              </Select>
              {errors.projectId && <p className="text-sm text-destructive mt-1">{errors.projectId.message}</p>}
            </div>

            {projectDetails && (
                <Card className="bg-secondary/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Completed Tasks (Auto-Filled)</CardTitle>
                        <CardDescription className="text-xs">Based on the project's task list.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                            {projectDetails.tasks.filter(t => t.completed).map(t => <li key={t.id}>{t.text}</li>)}
                            {projectDetails.tasks.filter(t => t.completed).length === 0 && <li>No tasks marked as complete.</li>}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <div>
              <Label htmlFor="nextSteps">Plan for Next Week</Label>
              <Textarea
                id="nextSteps"
                {...register('nextSteps')}
                placeholder="e.g., Finalize the logo variations based on feedback and begin designing the social media assets."
                rows={4}
              />
              {errors.nextSteps && <p className="text-sm text-destructive mt-1">{errors.nextSteps.message}</p>}
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarClock className="mr-2 h-4 w-4" />
              )}
              Generate Summary Email
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Summary</CardTitle>
          <CardDescription>A draft of the client update email will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Drafting your update...</p>
            </div>
          )}
          {result && (
            <div className="flex flex-col h-full">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap p-4 rounded-md border bg-secondary/50 flex-grow">
                {result.summaryEmail}
              </div>
              <Button onClick={copyToClipboard} variant="outline" className="mt-4">
                <Copy className="mr-2 h-4 w-4"/> Copy Email Text
              </Button>
            </div>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Wand2 className="h-10 w-10 mb-4" />
              <p>Ready to update your client?</p>
              <p className="text-xs">Select a project to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
