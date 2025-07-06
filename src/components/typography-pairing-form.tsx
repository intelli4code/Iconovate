"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateTypographyPairing, type TypographyPairingOutput } from '@/ai/flows/typography-pairing';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Type } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  brandVibe: z.string().min(10, { message: 'Please provide a more detailed description (at least 10 characters).' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function TypographyPairingForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TypographyPairingOutput | null>(null);
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
      const response = await generateTypographyPairing(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating typography pairings:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to suggest fonts. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Typography Inputs</CardTitle>
          <CardDescription>Describe your brand's personality to find the perfect font pairing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="brandVibe">Brand Vibe Description</Label>
              <Textarea
                id="brandVibe"
                {...register('brandVibe')}
                placeholder="e.g., A vintage-inspired menswear brand. Should feel rugged, classic, and sophisticated."
                rows={4}
              />
              {errors.brandVibe && <p className="text-sm text-destructive mt-1">{errors.brandVibe.message}</p>}
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
                  Find Font Pairings
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="lg:col-span-2">
        <Card>
            <CardHeader>
            <CardTitle>AI-Generated Font Pairings</CardTitle>
            <CardDescription>Your font suggestions will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] flex flex-col">
            {loading && (
                <div className="flex flex-col items-center justify-center flex-grow gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Searching for the perfect typefaces...</p>
                </div>
            )}
            {result ? (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {result.pairings.map((pairing, index) => (
                    <Card key={index} className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Headline: <span className="font-headline">{pairing.headlineFont}</span>
                            </CardTitle>
                            <CardDescription>
                                Body: <span className="font-body">{pairing.bodyFont}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Separator className="mb-3" />
                            <p className="text-sm text-muted-foreground">{pairing.rationale}</p>
                        </CardContent>
                    </Card>
                ))}
                </div>
            ) : !loading && (
                <div className="flex flex-col items-center justify-center flex-grow text-center text-muted-foreground bg-secondary/30 rounded-lg">
                <Type className="h-10 w-10 mb-4" />
                <p>Ready to set the tone?</p>
                <p className="text-xs">Describe your brand to see font pairings.</p>
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
