"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateSlogans, type SloganGeneratorOutput } from '@/ai/flows/slogan-generator';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Quote, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  brandDescription: z.string().min(10, { message: 'Please provide a more detailed brand description.' }),
  keywords: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function SloganGeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SloganGeneratorOutput | null>(null);
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
      const response = await generateSlogans(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating slogans:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate slogans. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Slogan Inputs</CardTitle>
          <CardDescription>Provide details about the brand to inspire the AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="brandDescription">Brand Description</Label>
              <Textarea
                id="brandDescription"
                {...register('brandDescription')}
                placeholder="e.g., An eco-friendly cleaning product company that uses all-natural ingredients to create powerful, safe, and pleasant-smelling solutions for the modern home."
                rows={4}
              />
              {errors.brandDescription && <p className="text-sm text-destructive mt-1">{errors.brandDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="keywords">Keywords (Optional)</Label>
              <Input
                id="keywords"
                {...register('keywords')}
                placeholder="e.g., natural, sustainable, clean, fresh, home"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Slogans
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Slogans</CardTitle>
          <CardDescription>Your catchy taglines will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col">
          {loading && (
            <div className="flex flex-col items-center justify-center flex-grow gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Thinking of some catchy phrases...</p>
            </div>
          )}
          {result ? (
            <div className="space-y-3">
              {result.slogans.map((slogan, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <Quote className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <p className="flex-1">{slogan}</p>
                </div>
              ))}
            </div>
          ) : !loading && (
            <div className="flex flex-col items-center justify-center flex-grow text-center text-muted-foreground bg-secondary/30 rounded-lg">
              <Quote className="h-10 w-10 mb-4" />
              <p>Ready to find your brand's voice?</p>
              <p className="text-xs">Describe your brand to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
