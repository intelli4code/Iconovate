"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzeBrief, type BriefAnalysisOutput } from '@/ai/flows/brief-analyzer';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, ClipboardCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const FormSchema = z.object({
  brief: z.string().min(50, { message: 'Brief must be at least 50 characters to be properly analyzed.' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function BriefAnalysisForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BriefAnalysisOutput | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await analyzeBrief(data);
      setResult(response);
    } catch (error) {
      console.error("Error analyzing brief:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "The AI was unable to analyze the brief. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Client Brief</CardTitle>
          <CardDescription>Paste the full client brief below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="brief">Project Brief Text</Label>
              <Textarea
                id="brief"
                {...register('brief')}
                placeholder="We are a new D2C startup called 'Fress' that sells fresh, organic dog food subscriptions..."
                rows={12}
              />
              {errors.brief && <p className="text-sm text-destructive mt-1">{errors.brief.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="mr-2 h-4 w-4" />
              )}
              Analyze Brief
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Analysis</CardTitle>
          <CardDescription>Your project breakdown will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Analyzing project scope...</p>
            </div>
          )}
          {result && (
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Suggested Timeline</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.timeline}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Potential Risks</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.risks}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Clarifying Questions</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.questions}</AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Wand2 className="h-10 w-10 mb-4" />
              <p>Ready to deconstruct a project?</p>
              <p className="text-xs">Paste a brief to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
