"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { brandResearch, type BrandResearchOutput } from '@/ai/flows/brand-research';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

const FormSchema = z.object({
  brandName: z.string().min(2, { message: 'Brand name must be at least 2 characters.' }),
  industry: z.string().min(3, { message: 'Industry must be at least 3 characters.' }),
  targetAudience: z.string().min(10, { message: 'Target audience description must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function BrandResearchForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrandResearchOutput | null>(null);
  const { toast } = useToast()

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
      const response = await brandResearch(data);
      setResult(response);
    } catch (error) {
      console.error("Error during brand research:", error);
      toast({
        variant: "destructive",
        title: "Research Failed",
        description: "The AI was unable to complete the research. Please try again.",
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Research Inputs</CardTitle>
          <CardDescription>Provide the core details for your brand research.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="brandName">Brand Name</Label>
              <Input id="brandName" {...register('brandName')} placeholder="e.g., Aether-Core Dynamics" />
              {errors.brandName && <p className="text-sm text-destructive mt-1">{errors.brandName.message}</p>}
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...register('industry')} placeholder="e.g., Aerospace Technology" />
              {errors.industry && <p className="text-sm text-destructive mt-1">{errors.industry.message}</p>}
            </div>
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea id="targetAudience" {...register('targetAudience')} placeholder="e.g., Engineers, defense contractors, and tech enthusiasts aged 30-60." />
              {errors.targetAudience && <p className="text-sm text-destructive mt-1">{errors.targetAudience.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start AI Research
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
          <CardDescription>Your brand research results will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Analyzing markets and competitors...</p>
              <p className="text-xs">Generating images can take a moment.</p>
            </div>
          )}
          {result && (
            <Accordion type="single" collapsible defaultValue="item-3" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Market Insights</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
                  {result.marketInsights}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Competitor Branding Analysis</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
                   {result.competitorBrandingAnalysis}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Data-Driven Mood Board</AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4 whitespace-pre-line">
                    {result.moodBoardDescription}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {result.moodBoardImages.map((src, index) => (
                      <div key={index} className="relative aspect-square w-full overflow-hidden rounded-lg border">
                        <Image src={src} alt={`Mood board image ${index + 1}`} layout="fill" objectFit="cover" />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground">
              <Sparkles className="h-10 w-10 mb-4" />
              <p>Ready to uncover brand secrets?</p>
              <p className="text-xs">Fill out the form to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
