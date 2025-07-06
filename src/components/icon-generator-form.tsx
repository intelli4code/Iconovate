"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateIconSet, type IconSetGeneratorOutput } from '@/ai/flows/icon-set-generator';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Shapes } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  style: z.string().min(10, { message: "Please provide a more detailed style description." }),
  concepts: z.string().min(3, { message: "Please provide at least one concept." }),
});


type FormValues = z.infer<typeof FormSchema>;

export function IconGeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IconSetGeneratorOutput | null>(null);
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
      const response = await generateIconSet(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating icon set:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the icon set. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Icon Set Generator</CardTitle>
          <CardDescription>Define the visual style and the concepts you need icons for.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="style">Icon Style</Label>
              <Textarea
                id="style"
                {...register('style')}
                placeholder="e.g., 3D claymation style, soft lighting, vibrant pastel colors"
                rows={3}
              />
              {errors.style && <p className="text-sm text-destructive mt-1">{errors.style.message as string}</p>}
            </div>
             <div>
              <Label htmlFor="concepts">Icon Concepts (comma-separated)</Label>
              <Input
                id="concepts"
                {...register('concepts')}
                placeholder="e.g., user, settings, home, mail, search, analytics, cart, notification"
              />
              {errors.concepts && <p className="text-sm text-destructive mt-1">{errors.concepts.message as string}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Icons...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Icon Set
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Icon Set</CardTitle>
          <CardDescription>Your cohesive set of icons will appear here. This may take a minute.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Crafting your icons one by one...</p>
              <p className="text-xs">Patience is a virtue, especially with AI art!</p>
            </div>
          )}
          {result && result.icons.length > 0 && (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {result.icons.map((icon, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-white p-2">
                            <Image src={icon.imageDataUri} alt={`Icon for ${icon.concept}`} layout="fill" objectFit="contain" />
                        </div>
                        <p className="text-sm font-medium capitalize">{icon.concept}</p>
                    </div>
                ))}
            </div>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground bg-secondary/30 rounded-lg">
              <Shapes className="h-10 w-10 mb-4" />
              <p>Ready to create a unique icon set?</p>
              <p className="text-xs">Describe your style to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
