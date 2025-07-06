"use client";

import { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateLogoVariation, type LogoVariationOutput } from '@/ai/flows/logo-variation-generator';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  logo: z.any().refine(file => file instanceof File, 'A logo file is required.'),
  variationType: z.string().min(1, { message: 'Please select a variation type.' }),
});

type FormValues = z.infer<typeof FormSchema>;

const variationOptions = ["Monogram", "Icon Only", "Wordmark"];

// Helper to convert file to data URI
const toDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function LogoVariationForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LogoVariationOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      variationType: "Monogram",
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('logo', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const logoDataUri = await toDataURL(data.logo);
      const response = await generateLogoVariation({ logoDataUri, variationType: data.variationType });
      setResult(response);
    } catch (error) {
      console.error("Error generating variation:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the variation. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Variation Inputs</CardTitle>
          <CardDescription>Upload your logo and choose a variation type.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="logo">Original Logo File</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-secondary/50">
                  {preview ? (
                    <Image src={preview} alt="Logo preview" width={96} height={96} style={{objectFit: 'contain'}} />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Input 
                  id="logo" 
                  type="file" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleFileChange}
                  className={cn("flex-1", errors.logo && "border-destructive")}
                />
              </div>
              {errors.logo && <p className="text-sm text-destructive mt-1">{(errors.logo.message as string)}</p>}
            </div>
            <div>
              <Label>Variation Type</Label>
              <Controller
                name="variationType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-3 gap-4 mt-2"
                  >
                    {variationOptions.map(option => (
                      <Label key={option} htmlFor={option} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value={option} id={option} className="sr-only" />
                        {option}
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.variationType && <p className="text-sm text-destructive mt-1">{errors.variationType.message}</p>}
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
                  Generate Variation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Variation</CardTitle>
          <CardDescription>Your new logo variation will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Reimagining your logo...</p>
              <p className="text-xs">This can take up to 30 seconds.</p>
            </div>
          )}
          {result?.imageDataUri && (
            <div className="relative w-full h-full rounded-md overflow-hidden border bg-white p-4">
                <Image src={result.imageDataUri} alt="Generated logo variation" layout="fill" objectFit="contain" />
            </div>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-secondary/30 rounded-lg w-full">
              <Sparkles className="h-10 w-10 mb-4" />
              <p>Ready to create a logo variation?</p>
              <p className="text-xs">Upload a logo to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
