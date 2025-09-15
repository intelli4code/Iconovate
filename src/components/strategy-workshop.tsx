"use client";

import { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { runStrategyWorkshop } from '@/app/actions/run-strategy-workshop';
import type { ArchetypeAnalysisOutput, VisualSynthesisOutput, ProposalGeneratorOutput, WorkshopImage } from '@/app/actions/run-strategy-workshop';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles, Wand2, Lightbulb, UserCheck, Eye, FileSignature, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

const archetypeQuestions = [
    "How does your brand solve a problem for customers?",
    "What is your brand's personality? (e.g., playful, serious, adventurous)",
    "What is your company culture like?",
    "Who are your biggest competitors and how are you different?",
    "What do you want customers to feel when they interact with your brand?"
];

const archetypeSchema = z.object({
  answers: z.array(z.string().min(10, "Please provide a more detailed answer.")).length(5),
});
type ArchetypeFormValues = z.infer<typeof archetypeSchema>;

type WorkshopStep = 'archetype' | 'visuals' | 'proposal';

export function StrategyWorkshop() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkshopStep>('archetype');
  const { toast } = useToast();

  // State for step 1: Archetype Analysis
  const [archetypeResult, setArchetypeResult] = useState<ArchetypeAnalysisOutput | null>(null);
  
  // State for step 2: Visual Selection
  const [imageOptions, setImageOptions] = useState<WorkshopImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  // State for step 3: Visual Synthesis & Proposal
  const [visualResult, setVisualResult] = useState<VisualSynthesisOutput | null>(null);
  const [proposalResult, setProposalResult] = useState<ProposalGeneratorOutput | null>(null);

  const {
    register: archetypeRegister,
    handleSubmit: handleArchetypeSubmit,
    formState: { errors: archetypeErrors },
  } = useForm<ArchetypeFormValues>({
    resolver: zodResolver(archetypeSchema),
    defaultValues: { answers: Array(5).fill("") },
  });

  const onArchetypeSubmit: SubmitHandler<ArchetypeFormValues> = async (data) => {
    setLoading(true);
    setArchetypeResult(null);
    setImageOptions([]);
    try {
      const response = await runStrategyWorkshop({ step: 'archetype', archetypeInput: data });
      if (response.archetypeResult && response.imageOptions) {
        setArchetypeResult(response.archetypeResult);
        setImageOptions(response.imageOptions);
        setCurrentStep('visuals');
      } else {
        throw new Error(response.error || "Failed to get archetype analysis and image options.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Analysis Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageSelection = (url: string) => {
    setSelectedImages(prev => 
        prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const handleVisualsSubmit = async () => {
    if (selectedImages.length < 3) {
      toast({ variant: "destructive", title: "Please select at least 3 images." });
      return;
    }
    setLoading(true);
    setVisualResult(null);
    setProposalResult(null);

    try {
        const selectedImageData = imageOptions.filter(opt => selectedImages.includes(opt.url));
        const response = await runStrategyWorkshop({ 
            step: 'proposal',
            visualInput: { images: selectedImageData },
            archetypeAnalysis: archetypeResult?.analysis,
            clientName: "Valued Client",
        });

        if (response.visualResult && response.proposalResult) {
            setVisualResult(response.visualResult);
            setProposalResult(response.proposalResult);
            setCurrentStep('proposal');
        } else {
            throw new Error(response.error || "Failed to generate proposal.");
        }

    } catch (error: any) {
         toast({ variant: "destructive", title: "Synthesis Failed", description: error.message });
    } finally {
        setLoading(false);
    }
  }
  
  const progress = currentStep === 'archetype' ? 0 : currentStep === 'visuals' ? 33 : currentStep === 'proposal' ? 66 : 100;
  
  return (
    <Card>
      <CardHeader>
        <Progress value={progress} className="mb-4 h-2" />
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span className={cn(currentStep === 'archetype' && "text-primary")}>1. Archetype</span> &rarr;
                <span className={cn(currentStep === 'visuals' && "text-primary")}>2. Visuals</span> &rarr;
                <span className={cn(currentStep === 'proposal' && "text-primary")}>3. Proposal</span>
            </div>
            <Button variant="outline" onClick={() => setCurrentStep('archetype')}>Start Over</Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {currentStep === 'archetype' && (
            <div className="mt-4">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><UserCheck /> Step 1: Define Your Brand Archetype</h2>
                <p className="text-muted-foreground mb-6">Answer these questions to discover your brand's core identity.</p>
                <form onSubmit={handleArchetypeSubmit(onArchetypeSubmit)} className="space-y-4">
                    {archetypeQuestions.map((q, i) => (
                        <div key={i}>
                            <Label htmlFor={`q-${i}`}>{i + 1}. {q}</Label>
                            <Textarea id={`q-${i}`} {...archetypeRegister(`answers.${i}`)} rows={2} />
                            {archetypeErrors.answers?.[i] && <p className="text-sm text-destructive mt-1">{archetypeErrors.answers[i]?.message}</p>}
                        </div>
                    ))}
                    <Button type="submit" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Analyze Archetype</>}
                    </Button>
                </form>
            </div>
        )}
        
        {currentStep === 'visuals' && (
            <div className="mt-4">
                 <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Eye /> Step 2: Choose Your Visual Style</h2>
                <p className="text-muted-foreground mb-6">We've generated images based on your archetype. Select at least 3 that resonate with you to create a visual direction.</p>
                {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/></div>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {imageOptions.map(({ url, prompt }) => (
                        <div key={url} onClick={() => handleImageSelection(url)} className={cn("relative aspect-square rounded-lg overflow-hidden border-4 cursor-pointer transition-all", selectedImages.includes(url) ? 'border-primary scale-95' : 'border-transparent')}>
                             <Image src={url} alt={prompt} layout="fill" objectFit="cover" />
                             {selectedImages.includes(url) && (
                                <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
                                    <Check className="h-10 w-10 text-white" />
                                </div>
                             )}
                        </div>
                    ))}
                </div>
                <Button onClick={handleVisualsSubmit} disabled={loading || selectedImages.length < 3}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Synthesizing...</> : <><Wand2 className="mr-2 h-4 w-4" /> Synthesize Visuals</>}
                </Button>
            </div>
        )}

        {currentStep === 'proposal' && (
             <div className="mt-4">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FileSignature /> Step 3: Your Strategic Proposal</h2>
                <p className="text-muted-foreground mb-6">Based on your inputs, here is a complete project proposal.</p>
                
                {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/></div>}

                {proposalResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{proposalResult.proposalTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Executive Summary</AccordionTrigger>
                                    <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{proposalResult.executiveSummary}</AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Strategic Approach</AccordionTrigger>
                                    <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{proposalResult.strategicApproach}</AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Scope of Work</AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-2">
                                            {proposalResult.scopeOfWork.map((item, index) => (
                                                <li key={index}>
                                                    <p className="font-semibold">{item.service}</p>
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-4">
                                    <AccordionTrigger>Estimated Timeline</AccordionTrigger>
                                    <AccordionContent>{proposalResult.timeline}</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                )}
            </div>
        )}

      </CardContent>
    </Card>
  );
}
