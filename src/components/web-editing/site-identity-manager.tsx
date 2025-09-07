
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";

const identitySchema = z.object({
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

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
  });

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, (docSnap) => {
        const data = docSnap.data();
        if (data && data.identity) {
            setIdentity(data.identity);
            setLogoPreview(data.identity.logoUrl);
            setFaviconPreview(data.identity.faviconUrl);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
          <CardTitle>Logo & Favicon</CardTitle>
          <CardDescription>Upload your brand assets here. Changes will be reflected on your live site.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
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
        </CardContent>
        <CardContent>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
