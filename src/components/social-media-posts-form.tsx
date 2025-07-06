"use client";

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateSocialMediaPosts, type SocialMediaPostsOutput } from '@/ai/flows/social-media-post-generator';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Megaphone, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Slider } from './ui/slider';

const platformOptions = ["Instagram", "Twitter / X", "Facebook", "LinkedIn"];

const FormSchema = z.object({
  brandDescription: z.string().min(10, { message: 'Please provide a more detailed brand description.' }),
  brandVoice: z.string().min(3, { message: 'Please describe the brand voice.' }),
  platform: z.string().min(1, { message: 'Please select a platform.' }),
  numberOfPosts: z.number().min(1).max(7).default(3),
});

type FormValues = z.infer<typeof FormSchema>;

export function SocialMediaPostsForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialMediaPostsOutput | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        platform: "Instagram",
        numberOfPosts: 3,
    }
  });

  const numberOfPosts = watch('numberOfPosts');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await generateSocialMediaPosts(data);
      setResult(response);
    } catch (error) {
      console.error("Error generating posts:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to generate social media posts. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Campaign</CardTitle>
          <CardDescription>Provide brand details to generate a series of social media posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="brandDescription">Brand Description</Label>
              <Textarea
                id="brandDescription"
                {...register('brandDescription')}
                placeholder="e.g., An eco-friendly cleaning product company that uses all-natural ingredients..."
                rows={4}
              />
              {errors.brandDescription && <p className="text-sm text-destructive mt-1">{errors.brandDescription.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="brandVoice">Brand Voice</Label>
                    <Input id="brandVoice" {...register('brandVoice')} placeholder="e.g., Witty, educational, and slightly playful" />
                    {errors.brandVoice && <p className="text-sm text-destructive mt-1">{errors.brandVoice.message}</p>}
                </div>
                <div>
                    <Label>Platform</Label>
                    <Controller
                        name="platform"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select a platform" /></SelectTrigger>
                                <SelectContent>
                                    {platformOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.platform && <p className="text-sm text-destructive mt-1">{errors.platform.message}</p>}
                </div>
            </div>

            <div>
                <Label>Number of Posts: {numberOfPosts}</Label>
                <Controller
                    name="numberOfPosts"
                    control={control}
                    render={({ field }) => (
                        <Slider
                            min={1}
                            max={7}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                        />
                    )}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Posts...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Posts
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Writing your social media content...</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
            {result.posts.map((post, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>Post {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-xs text-muted-foreground">Post Text</Label>
                            <p className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">{post.postText}</p>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-md bg-secondary/50">
                            <ImageIcon className="h-4 w-4 mt-1 text-primary"/>
                            <div>
                                <Label className="text-xs text-muted-foreground">Image Prompt</Label>
                                <p className="text-sm">{post.imagePrompt}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      {!loading && !result && (
        <Card className="flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground bg-secondary/30">
          <Megaphone className="h-10 w-10 mb-4" />
          <p className="text-lg font-medium">Your generated posts will appear here</p>
          <p className="text-xs">Fill out the form to get started.</p>
        </Card>
      )}
    </div>
  );
}
