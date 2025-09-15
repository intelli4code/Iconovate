"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import type { SiteIdentity } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";

const identitySchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  siteKeywords: z.string().optional(),
  logoHeight: z.number().min(20).max(100).default(40),
  logo: z.any().optional(),
  favicon: z.any().optional(),
});

type IdentityFormValues = z.infer<typeof identitySchema>;

export function SiteIdentityManager() {
  const { toast } = useToast();
  const [identity, setIdentity] = useState<SiteIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const { register, handleSubmit, setValue, reset, control, watch, formState: { errors, isSubmitting } } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
        siteName: "BrandBoost AI",
        siteDescription: "AI-Powered Brand Design Automation Platform",
        siteKeywords: "",
        logoHeight: 40,
    }
  });

  const logoHeightValue = watch("logoHeight");

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, (docSnap) => {
        const data = docSnap.data();
        if (data && data.identity) {
            const idData = data.identity as SiteIdentity;
            setIdentity(idData);
            reset({
                siteName: idData.siteName || "BrandBoost AI",
                siteDescription: idData.siteDescription || "AI-Powered Brand Design Automation Platform",
                siteKeywords: idData.siteKeywords || "",
                logoHeight: idData.logoHeight || 40,
            });
            setLogoPreview(idData.logoUrl || null);
            setFaviconPreview(idData.faviconUrl || null);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(type, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') setLogoPreview(reader.result as string);
        if (type === 'favicon') setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, oldPath?: string) => {
    if (!supabase) throw new Error("Supabase not configured.");
    if (oldPath) {
      await supabase.storage.from('main').remove([oldPath]);
    }
    const newPath = `site-identity/${uuidv4()}-${file.name}`;
    const { error } = await supabase.storage.from('main').upload(newPath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('main').getPublicUrl(newPath);
    return { url: data.publicUrl, path: newPath };
  };

  const onSubmit = async (data: IdentityFormValues) => {
    try {
      let updatedIdentity = { ...identity };

      if (data.logo instanceof File) {
        const { url, path } = await uploadFile(data.logo, identity?.logoPath);
        updatedIdentity.logoUrl = url;
        updatedIdentity.logoPath = path;
      }

      if (data.favicon instanceof File) {
        const { url, path } = await uploadFile(data.favicon, identity?.faviconPath);
        updatedIdentity.faviconUrl = url;
        updatedIdentity.faviconPath = path;
      }
      
      updatedIdentity = {
          ...updatedIdentity,
          siteName: data.siteName,
          siteDescription: data.siteDescription,
          siteKeywords: data.siteKeywords,
          logoHeight: data.logoHeight,
      };

      await updateDoc(doc(db, "siteContent", "main"), { identity: updatedIdentity });
      toast({ title: "Site Identity Updated" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Site Identity & Metadata</CardTitle>
          <CardDescription>Manage your brand assets and SEO information for your public website.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" {...register("siteName")} />
                {errors.siteName && <p className="text-sm text-destructive">{errors.siteName.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description (for SEO)</Label>
                <Textarea id="siteDescription" {...register("siteDescription")} />
                 {errors.siteDescription && <p className="text-sm text-destructive">{errors.siteDescription.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="siteKeywords">Keywords (comma-separated)</Label>
                <Input id="siteKeywords" {...register("siteKeywords")} />
                 {errors.siteKeywords && <p className="text-sm text-destructive">{errors.siteKeywords.message}</p>}
            </div>
          </div>
          <div className="space-y-4">
             <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-secondary/50 p-1">
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Logo preview" width={96} height={96} className="object-contain" />
                    ) : (
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Input id="logo-file" type="file" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*,.svg" />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Favicon</Label>
                 <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-secondary/50 p-1">
                    {faviconPreview ? (
                      <Image src={faviconPreview} alt="Favicon preview" width={96} height={96} className="object-contain" />
                    ) : (
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Input id="favicon-file" type="file" onChange={(e) => handleFileChange(e, 'favicon')} accept="image/x-icon,image/png,image/svg+xml" />
                </div>
                <p className="text-xs text-muted-foreground">Recommended size: 32x32px or larger.</p>
              </div>
          </div>
        </CardContent>
         <CardHeader className="pt-0">
            <CardTitle>Header Logo Size</CardTitle>
            <CardDescription>Adjust the height of the logo in the website header.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Label>Logo Height: {logoHeightValue}px</Label>
                <Controller
                    name="logoHeight"
                    control={control}
                    render={({ field }) => (
                        <Slider
                            min={20}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                        />
                    )}
                />
            </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
