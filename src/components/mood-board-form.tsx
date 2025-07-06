"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateMoodBoard, type MoodBoardOutput } from '@/ai/flows/mood-board-generator';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function MoodBoardForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MoodBoardOutput | null>(null);
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
      const response = await generateMoodBoard(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating mood board:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the mood board. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Mood Board Prompt</CardTitle>
          <CardDescription>Describe the brand's aesthetic, vibe, or target audience. Be as descriptive as you like.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="description">Brand Vision Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="e.g., A sustainable, minimalist skincare brand for urban professionals. Think clean lines, natural textures like stone and wood, muted earth tones, and a feeling of calm and clarity."
                rows={4}
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Mood Board
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Mood Board</CardTitle>
          <CardDescription>Your visual inspiration will appear here. This can take a minute.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Gathering inspiration and generating images...</p>
              <p className="text-xs">This is intensive, thanks for your patience.</p>
            </div>
          )}
          {result && (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {result.moodBoardImages.map((src, index) => (
                    <div key={index} className="relative aspect-square w-full overflow-hidden rounded-lg border">
                    <Image src={src} alt={`Mood board image ${index + 1}`} layout="fill" objectFit="cover" />
                    </div>
                ))}
            </div>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground bg-secondary/30 rounded-lg">
              <Sparkles className="h-10 w-10 mb-4" />
              <p>Ready to visualize your brand?</p>
              <p className="text-xs">Describe your vision to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
