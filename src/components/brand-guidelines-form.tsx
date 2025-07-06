"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateBrandGuidelines, type BrandGuidelinesOutput } from '@/ai/flows/brand-guidelines-generator';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  brandName: z.string().min(2, { message: 'Brand name must be at least 2 characters.' }),
  logoDescription: z.string().min(10, { message: 'Logo description must be at least 10 characters.' }),
  colorPalette: z.string().min(10, { message: 'Please describe the color palette.' }),
  typography: z.string().min(10, { message: 'Please describe the typography.' }),
  brandVoice: z.string().min(10, { message: 'Please describe the brand voice.' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function BrandGuidelinesForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrandGuidelinesOutput | null>(null);
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
      const response = await generateBrandGuidelines(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating brand guidelines:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the guidelines. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Guideline Inputs</CardTitle>
          <CardDescription>Provide the key elements of the brand identity.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="brandName">Brand Name</Label>
              <Input id="brandName" {...register('brandName')} placeholder="e.g., Aether-Core Dynamics" />
              {errors.brandName && <p className="text-sm text-destructive mt-1">{errors.brandName.message}</p>}
            </div>
            <div>
              <Label htmlFor="logoDescription">Logo Description</Label>
              <Textarea id="logoDescription" {...register('logoDescription')} placeholder="e.g., A minimalist monogram of 'AC' with a subtle wing, symbolizing speed and precision." />
              {errors.logoDescription && <p className="text-sm text-destructive mt-1">{errors.logoDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="colorPalette">Color Palette</Label>
              <Input id="colorPalette" {...register('colorPalette')} placeholder="e.g., Deep midnight blue (#0B132B), silver-gray (#8D99AE), and a vibrant cyan accent (#14FFEC)." />
              {errors.colorPalette && <p className="text-sm text-destructive mt-1">{errors.colorPalette.message}</p>}
            </div>
             <div>
              <Label htmlFor="typography">Typography</Label>
              <Input id="typography" {...register('typography')} placeholder="e.g., Headings: Montserrat Bold, Body: PT Sans Regular" />
              {errors.typography && <p className="text-sm text-destructive mt-1">{errors.typography.message}</p>}
            </div>
             <div>
              <Label htmlFor="brandVoice">Brand Voice / Tone</Label>
              <Textarea id="brandVoice" {...register('brandVoice')} placeholder="e.g., Professional, authoritative, innovative, and slightly futuristic." />
              {errors.brandVoice && <p className="text-sm text-destructive mt-1">{errors.brandVoice.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Guidelines
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Brand Guidelines</CardTitle>
          <CardDescription>Your complete brand identity document will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Constructing your brand's rulebook...</p>
            </div>
          )}
          {result && (
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Logo Usage</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.logoUsage}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Color System</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.colorSystem}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Typography Guidelines</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.typographyGuidelines}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Imagery Style</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.imageryStyle}</AccordionContent>
              </AccordionItem>
               <AccordionItem value="item-5">
                <AccordionTrigger>Brand Voice</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{result.brandVoice}</AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Wand2 className="h-10 w-10 mb-4" />
              <p>Ready to define your brand?</p>
              <p className="text-xs">Fill out the form to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
