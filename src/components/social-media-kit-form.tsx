"use client";

import { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateSocialMediaKit, type SocialMediaKitOutput } from '@/ai/flows/social-media-kit-generator';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  logo: z.any().refine(file => file instanceof File, 'A logo file is required.'),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color code."),
  platform: z.string().min(1, { message: 'Please select a platform.' }),
});

type FormValues = z.infer<typeof FormSchema>;

const platformOptions = ["Facebook", "Twitter / X", "Instagram", "LinkedIn", "YouTube", "Pinterest"];

// Helper to convert file to data URI
const toDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function SocialMediaKitForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialMediaKitOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
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
      const response = await generateSocialMediaKit({
        logoDataUri,
        primaryColor: data.primaryColor,
        platform: data.platform
      });
      setResult(response);
    } catch (error) {
      console.error("Error generating social media kit:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate the assets. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Kit Inputs</CardTitle>
          <CardDescription>Upload a logo and provide brand details to generate your kit.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className='grid md:grid-cols-2 gap-6'>
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
                    <Input 
                    id="logo" 
                    type="file" 
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleFileChange}
                    className={cn("flex-1", errors.logo && "border-destructive")} />
                </div>
                {errors.logo && <p className="text-sm text-destructive mt-1">{(errors.logo.message as string)}</p>}
                </div>
                <div className='space-y-6'>
                    <div>
                        <Label htmlFor="primaryColor">Primary Brand Color (Hex)</Label>
                        <Input id="primaryColor" {...register('primaryColor')} placeholder="#4B0082" />
                        {errors.primaryColor && <p className="text-sm text-destructive mt-1">{errors.primaryColor.message}</p>}
                    </div>
                    <div>
                        <Label>Social Media Platform</Label>
                        <Controller
                            name="platform"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {platformOptions.map(option => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.platform && <p className="text-sm text-destructive mt-1">{errors.platform.message}</p>}
                    </div>
                </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Kit...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Kit
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Social Media Kit</CardTitle>
          <CardDescription>Your profile picture and banner will appear here. This may take a minute.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Designing your social media assets...</p>
            </div>
          )}
          {result ? (
             <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-white p-2">
                        <Image src={result.profilePictureUri} alt="Generated Profile Picture" layout="fill" objectFit="contain" />
                    </div>
                </div>
                <div className="md:col-span-3 space-y-2">
                    <Label>Banner Image</Label>
                    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border bg-white p-2">
                        <Image src={result.bannerUri} alt="Generated Banner" layout="fill" objectFit="contain" />
                    </div>
                </div>
            </div>
          ) : !loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground bg-secondary/30 rounded-lg">
              <Sparkles className="h-10 w-10 mb-4" />
              <p>Ready to build your social presence?</p>
              <p className="text-xs">Fill out the form to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
