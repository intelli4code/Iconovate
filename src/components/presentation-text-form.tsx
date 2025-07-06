"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePresentationText, type PresentationTextOutput } from '@/ai/flows/presentation-text-tool';
import { generateAudioFromText, type TextToSpeechOutput } from '@/ai/flows/text-to-speech-generator';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Ear } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from './ui/separator';

const FormSchema = z.object({
  logoDescription: z.string().min(10, { message: 'Please provide a more detailed logo description.' }),
  brandDescription: z.string().min(10, { message: 'Please provide a more detailed brand description.' }),
  projectDetails: z.string().min(10, { message: 'Please provide more detailed project details.' }),
  keywords: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function PresentationTextForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PresentationTextOutput | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioResult, setAudioResult] = useState<TextToSpeechOutput | null>(null);
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
    setAudioResult(null);
    try {
      const response = await generatePresentationText(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating presentation text:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the text. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!result?.presentationText) return;
    setAudioLoading(true);
    setAudioResult(null);
    try {
        const audioResponse = await generateAudioFromText({ text: result.presentationText });
        setAudioResult(audioResponse);
    } catch (error) {
        console.error("Error generating audio:", error);
        toast({
            variant: "destructive",
            title: "Audio Generation Failed",
            description: "Could not convert text to speech. Please try again.",
        });
    } finally {
        setAudioLoading(false);
    }
  };


  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Presentation Inputs</CardTitle>
          <CardDescription>Describe the project, and the AI will write the presentation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="logoDescription">Logo Description</Label>
              <Textarea id="logoDescription" {...register('logoDescription')} placeholder="e.g., A minimalist monogram featuring the letters 'A' and 'C' with a subtle wing." />
              {errors.logoDescription && <p className="text-sm text-destructive mt-1">{errors.logoDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="brandDescription">Brand Description</Label>
              <Textarea id="brandDescription" {...register('brandDescription')} placeholder="e.g., A luxury brand focused on precision, innovation, and trust." />
              {errors.brandDescription && <p className="text-sm text-destructive mt-1">{errors.brandDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="projectDetails">Project Details & Goals</Label>
              <Textarea id="projectDetails" {...register('projectDetails')} placeholder="e.g., Rebranding to attract a younger, tech-savvy audience and expand into international markets." />
              {errors.projectDetails && <p className="text-sm text-destructive mt-1">{errors.projectDetails.message}</p>}
            </div>
            <div>
              <Label htmlFor="keywords">Optional Keywords</Label>
              <Input id="keywords" {...register('keywords')} placeholder="e.g., modern, sleek, innovative, trustworthy" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Writing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Text
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Presentation Text</CardTitle>
          <CardDescription>Your compelling, client-ready text will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="h-full flex flex-col">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Crafting the perfect narrative...</p>
            </div>
          )}
          {result && (
            <div className="flex flex-col h-full">
              <Textarea 
                readOnly 
                value={result.presentationText}
                className="flex-grow text-base resize-none"
                rows={15}
              />
              <Separator className="my-4" />
              <div className="space-y-4">
                <Button onClick={handleGenerateAudio} disabled={audioLoading || loading} className="w-full">
                    {audioLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Ear className="mr-2 h-4 w-4" />
                    )}
                    Generate Audio
                </Button>
                {audioLoading && <p className="text-sm text-center text-muted-foreground">Generating audio... this may take a moment.</p>}
                {audioResult?.audioDataUri && (
                    <audio controls src={audioResult.audioDataUri} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                )}
              </div>
            </div>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-secondary/30 rounded-lg">
              <Wand2 className="h-10 w-10 mb-4" />
              <p>Ready to captivate your client?</p>
              <p className="text-xs">Fill out the form to generate your script.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
