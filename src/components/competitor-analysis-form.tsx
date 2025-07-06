"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzeCompetitor, type CompetitorAnalysisOutput } from '@/ai/flows/competitor-analyzer';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Search, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  competitorWebsiteUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function CompetitorAnalysisForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorAnalysisOutput | null>(null);
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
      const response = await analyzeCompetitor(data);
      setResult(response);
    } catch (error) {
      console.error("Error analyzing competitor:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "The AI was unable to analyze the website. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Competitor URL</CardTitle>
          <CardDescription>Enter the full website URL of the competitor you want to analyze.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="competitorWebsiteUrl">Website URL</Label>
              <Input id="competitorWebsiteUrl" {...register('competitorWebsiteUrl')} placeholder="https://www.example.com" />
              {errors.competitorWebsiteUrl && <p className="text-sm text-destructive mt-1">{errors.competitorWebsiteUrl.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Competitor
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Analysis</CardTitle>
          <CardDescription>The branding analysis of your competitor will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Scanning the competition...</p>
            </div>
          )}
          {result && (
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Visual Style Analysis</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.visualStyleAnalysis}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Tone of Voice Analysis</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.toneOfVoiceAnalysis}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Market Positioning</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.marketPositioning}</AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Wand2 className="h-10 w-10 mb-4" />
              <p>Ready for some competitive intelligence?</p>
              <p className="text-xs">Enter a URL to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
