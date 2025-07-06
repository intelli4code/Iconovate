"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePersonas, type PersonaGeneratorOutput } from '@/ai/flows/persona-generator';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, UsersRound } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from './ui/separator';

const FormSchema = z.object({
  brandDescription: z.string().min(20, { message: 'Please provide a more detailed description (at least 20 characters).' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function PersonaGeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PersonaGeneratorOutput | null>(null);
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
      const response = await generatePersonas(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating personas:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate personas. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Persona Inputs</CardTitle>
          <CardDescription>Describe your brand and its target market to create user personas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="brandDescription">Brand & Market Description</Label>
              <Textarea
                id="brandDescription"
                {...register('brandDescription')}
                placeholder="e.g., A sustainable, minimalist skincare brand for urban professionals. The target market values high-quality, natural ingredients and transparent business practices."
                rows={4}
              />
              {errors.brandDescription && <p className="text-sm text-destructive mt-1">{errors.brandDescription.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UsersRound className="mr-2 h-4 w-4" />
              )}
              Generate Personas
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Researching your audience...</p>
        </div>
      )}

      {result && (
        <div className="grid lg:grid-cols-3 gap-6">
          {result.personas.map((persona, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{persona.name}</CardTitle>
                <CardDescription className="text-primary">{persona.demographics}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm">Goals</h4>
                  <p className="text-sm text-muted-foreground">{persona.goals}</p>
                </div>
                 <div>
                  <h4 className="font-semibold text-sm">Motivations</h4>
                  <p className="text-sm text-muted-foreground">{persona.motivations}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
