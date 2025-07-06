"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateColorPalette, type ColorPaletteOutput } from '@/ai/flows/color-palette-generator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Palette } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  brandVibe: z.string().min(10, { message: 'Please provide a more detailed description (at least 10 characters).' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function ColorPaletteForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ColorPaletteOutput | null>(null);
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
      const response = await generateColorPalette(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating color palette:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the palette. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: `${text} is now in your clipboard.`,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Palette Generator</CardTitle>
          <CardDescription>Describe the feeling or industry of your brand to generate a color palette.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="brandVibe">Brand Vibe Description</Label>
              <Textarea
                id="brandVibe"
                {...register('brandVibe')}
                placeholder="e.g., A SaaS company focused on productivity and collaboration. Should feel modern, clean, and trustworthy."
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
                  <Palette className="mr-2 h-4 w-4" />
                  Generate Palette
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Palette</CardTitle>
          <CardDescription>Your custom color palette will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col">
          {loading && (
            <div className="flex flex-col items-center justify-center flex-grow gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Mixing the perfect colors...</p>
            </div>
          )}
          {result ? (
            <div>
              <h3 className="text-lg font-semibold font-headline text-center mb-4">{result.paletteName}</h3>
              <div className="space-y-2">
                {result.palette.map((color) => (
                  <div key={color.hex} className="flex items-center gap-4 p-2 rounded-md border" onClick={() => copyToClipboard(color.hex)}>
                    <div
                      className="h-12 w-12 rounded-md border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{color.name}</p>
                      <p className="text-sm text-muted-foreground">{color.role}</p>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">{color.hex}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : !loading && (
            <div className="flex flex-col items-center justify-center flex-grow text-center text-muted-foreground bg-secondary/30 rounded-lg">
              <Palette className="h-10 w-10 mb-4" />
              <p>Ready to find your brand's colors?</p>
              <p className="text-xs">Describe your vibe in the form to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
