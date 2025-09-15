"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateLogoConcept, type LogoConceptOutput } from '@/ai/flows/logo-generator';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  prompt: z.string().min(20, { message: 'Please provide a more detailed description (at least 20 characters).' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function LogoGeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LogoConceptOutput | null>(null);
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
      const response = await generateLogoConcept(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating logo concept:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the logo. Please try a different prompt.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Logo Prompt</CardTitle>
          <CardDescription>Describe the logo you want to create. Be as specific as possible.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="prompt">Logo Description</Label>
              <Textarea 
                id="prompt" 
                {...register('prompt')} 
                placeholder="e.g., A minimalist logo for a coffee shop named 'The Daily Grind'. Use a coffee bean icon incorporated into a letter 'G'. Colors should be warm browns and cream."
                rows={6}
              />
              {errors.prompt && <p className="text-sm text-destructive mt-1">{errors.prompt.message}</p>}
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
                  Generate Logo Concept
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Logo Concept</CardTitle>
          <CardDescription>Your generated logo will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Bringing your logo idea to life...</p>
              <p className="text-xs">This can take up to 30 seconds.</p>
            </div>
          )}
          {result?.imageDataUri && (
            <div className="relative w-full h-full rounded-md overflow-hidden border bg-white p-4">
                <Image src={result.imageDataUri} alt="Generated logo concept" layout="fill" objectFit="contain" />
            </div>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-secondary/30 rounded-lg w-full">
              <Wand2 className="h-10 w-10 mb-4" />
              <p>Ready to create a logo?</p>
              <p className="text-xs">Describe your vision in the form to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
