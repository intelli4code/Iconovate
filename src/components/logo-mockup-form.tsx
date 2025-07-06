"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateLogoMockup, type LogoMockupOutput } from '@/ai/flows/logo-mockup-generator';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  logo: z.any().refine(files => files?.length > 0, 'A logo file is required.'),
  mockupType: z.string().min(1, { message: 'Please select a mockup type.' }),
});

type FormValues = z.infer<typeof FormSchema>;

const mockupOptions = [
  "T-Shirt on a person",
  "Business Card",
  "Website on a laptop screen",
  "Coffee Mug",
  "Building Signage",
  "Tote Bag",
  "Mobile App Icon",
];

// Helper to convert file to data URI
const toDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function LogoMockupForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LogoMockupOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });
  
  const logoFile = watch('logo');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('logo', e.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const logoDataUri = await toDataURL(data.logo[0]);
      const response = await generateLogoMockup({ logoDataUri, mockupType: data.mockupType });
      setResult(response);
    } catch (error) {
      console.error("Error generating mockup:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the mockup. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Mockup Inputs</CardTitle>
          <CardDescription>Upload your logo and choose a mockup style.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="logo">Logo File</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-secondary/50">
                  {preview ? (
                    <Image src={preview} alt="Logo preview" width={96} height={96} style={{objectFit: 'contain'}} />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Input id="logo" type="file" accept="image/png, image/jpeg, image/svg+xml" {...register('logo')} onChange={handleFileChange} className="flex-1" />
              </div>
              {errors.logo && <p className="text-sm text-destructive mt-1">{(errors.logo.message as string)}</p>}
            </div>
            <div>
              <Label htmlFor="mockupType">Mockup Type</Label>
               <Select onValueChange={(value) => setValue('mockupType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mockup type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockupOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              {errors.mockupType && <p className="text-sm text-destructive mt-1">{errors.mockupType.message}</p>}
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
                  Generate Mockup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Mockup</CardTitle>
          <CardDescription>Your generated mockup will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Placing your logo on the mockup...</p>
              <p className="text-xs">This can take up to 30 seconds.</p>
            </div>
          )}
          {result?.imageDataUri && (
            <div className="relative w-full h-full rounded-md overflow-hidden border">
                <Image src={result.imageDataUri} alt="Generated mockup" layout="fill" objectFit="contain" />
            </div>
          )}
          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-secondary/30 rounded-lg w-full">
              <Sparkles className="h-10 w-10 mb-4" />
              <p>Ready to see your logo in action?</p>
              <p className="text-xs">Fill out the form to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
