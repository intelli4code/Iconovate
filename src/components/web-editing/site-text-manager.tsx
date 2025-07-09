
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import type { PageContent } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const homePageSchema = z.object({
  heroTitle: z.string().min(1, "Title is required"),
  heroSubtitle: z.string().min(1, "Subtitle is required"),
  featureTitle: z.string().min(1, "Title is required"),
  featureSubtitle: z.string().min(1, "Subtitle is required"),
  featurePoint1Title: z.string().min(1, "Title is required"),
  featurePoint1Text: z.string().min(1, "Text is required"),
});

type HomePageFormValues = z.infer<typeof homePageSchema>;

const initialContent: PageContent = {
    home: {
        heroTitle: "Platform to build amazing brands and designs",
        heroSubtitle: "Learn from mentors who are experienced in their fields and get official certificates to build future careers.",
        featureTitle: "Intelligent Design on a New Scale",
        featureSubtitle: "Risus rutrum nisi, mi sed aliquam. Sit enim, id at viverra. Aliquam tortor.",
        featurePoint1Title: "Stay focused on your creative vision",
        featurePoint1Text: "Our AI handles the tedious parts of brand research and asset generation, letting you focus on high-impact creative work that drives results.",
    }
}

export function SiteTextManager() {
  const { toast } = useToast();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HomePageFormValues>({
    resolver: zodResolver(homePageSchema),
  });

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, async (docSnap) => {
      if (docSnap.exists() && docSnap.data().pageContent) {
        const content = docSnap.data().pageContent as PageContent;
        setPageContent(content);
        reset(content.home);
      } else {
        await updateDoc(contentDocRef, { pageContent: initialContent }, { merge: true });
        setPageContent(initialContent);
        reset(initialContent.home);
      }
      setLoading(false);
    }, () => {
      toast({ variant: "destructive", title: "Failed to load site content." });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast, reset]);

  const onSubmitHomepage = async (data: HomePageFormValues) => {
    try {
      await updateDoc(doc(db, "siteContent", "main"), {
        "pageContent.home": data,
      });
      toast({ title: "Homepage content updated!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }

  return (
    <Tabs defaultValue="homepage" className="w-full">
      <TabsList>
        <TabsTrigger value="homepage">Homepage</TabsTrigger>
        <TabsTrigger value="about" disabled>About Us</TabsTrigger>
        <TabsTrigger value="services" disabled>Services</TabsTrigger>
      </TabsList>
      <TabsContent value="homepage" className="mt-4">
        <form onSubmit={handleSubmit(onSubmitHomepage)}>
          <Card>
            <CardHeader>
              <CardTitle>Homepage Content</CardTitle>
              <CardDescription>Edit the text content for the main homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Hero Section</h3>
                    <div className="space-y-2">
                        <Label htmlFor="heroTitle">Title</Label>
                        <Textarea id="heroTitle" {...register("heroTitle")} rows={2} />
                        {errors.heroTitle && <p className="text-sm text-destructive">{errors.heroTitle.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="heroSubtitle">Subtitle</Label>
                        <Textarea id="heroSubtitle" {...register("heroSubtitle")} rows={3} />
                        {errors.heroSubtitle && <p className="text-sm text-destructive">{errors.heroSubtitle.message}</p>}
                    </div>
                </div>
                 <div className="p-4 border rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Feature Section</h3>
                    <div className="space-y-2">
                        <Label htmlFor="featureTitle">Title</Label>
                        <Input id="featureTitle" {...register("featureTitle")} />
                        {errors.featureTitle && <p className="text-sm text-destructive">{errors.featureTitle.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="featureSubtitle">Subtitle</Label>
                        <Input id="featureSubtitle" {...register("featureSubtitle")} />
                        {errors.featureSubtitle && <p className="text-sm text-destructive">{errors.featureSubtitle.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="featurePoint1Title">Feature Point Title</Label>
                        <Input id="featurePoint1Title" {...register("featurePoint1Title")} />
                        {errors.featurePoint1Title && <p className="text-sm text-destructive">{errors.featurePoint1Title.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="featurePoint1Text">Feature Point Text</Label>
                        <Textarea id="featurePoint1Text" {...register("featurePoint1Text")} rows={3} />
                        {errors.featurePoint1Text && <p className="text-sm text-destructive">{errors.featurePoint1Text.message}</p>}
                    </div>
                </div>
            </CardContent>
            <CardContent>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Homepage Content"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </TabsContent>
    </Tabs>
  );
}
