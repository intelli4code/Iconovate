

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import type { SiteImage } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, UploadCloud } from "lucide-react";

const imageSchema = z.object({
  imageHint: z.string().min(2, "Image hint is required"),
  image: z.any().refine(file => file instanceof File, "An image file is required"),
});

type ImageFormValues = z.infer<typeof imageSchema>;

const initialImageSlots: SiteImage[] = [
    { id: 'homeHero', name: 'Homepage Hero Image', description: 'The main image on the homepage.', imageUrl: 'https://placehold.co/800x600.png', imagePath: '', imageHint: 'app dashboard screenshot' },
    { id: 'homeFeature', name: 'Homepage Feature Image', description: 'The image in the "Intelligent Design" section.', imageUrl: 'https://placehold.co/800x600.png', imagePath: '', imageHint: 'app interface design' },
    { id: 'aboutStory', name: 'About Us Story Image', description: 'The image next to the "Our Story" text.', imageUrl: 'https://placehold.co/600x700.png', imagePath: '', imageHint: 'professional man' },
    { id: 'servicesProcess', name: 'Services Creative Process', description: 'The image in the "Creative Process" section on the services page.', imageUrl: 'https://placehold.co/600x400.png', imagePath: '', imageHint: 'design process flowchart' },
];

export function SiteImagesManager() {
  const { toast } = useToast();
  const [images, setImages] = useState<{ [key: string]: SiteImage }>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<SiteImage | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<ImageFormValues>({
    resolver: zodResolver(imageSchema),
  });

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, async (docSnap) => {
        if (docSnap.exists() && docSnap.data().images) {
            setImages(docSnap.data().images || {});
        } else {
            // If the document doesn't exist, create it with initial data
            const initialImagesObject = initialImageSlots.reduce((acc, img) => {
                acc[img.id] = img;
                return acc;
            }, {} as { [key: string]: SiteImage });
            await setDoc(contentDocRef, { images: initialImagesObject }, { merge: true });
            setImages(initialImagesObject);
        }
        setLoading(false);
    }, () => {
        toast({ variant: "destructive", title: "Failed to load site images." });
        setLoading(false);
    });
    return () => unsubscribe();
}, [toast]);


  const handleOpenDialog = (image: SiteImage) => {
    setEditingImage(image);
    reset({ imageHint: image.imageHint });
    setPreview(image.imageUrl);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ImageFormValues) => {
    if (!editingImage || !(data.image instanceof File)) return;
    if (!supabase) {
        toast({ variant: 'destructive', title: "Storage not configured."});
        return;
    }

    try {
        const imagePath = `site-images/${editingImage.id}/${uuidv4()}-${data.image.name}`;
        
        // Delete old image if it exists
        if (editingImage.imagePath) {
            await supabase.storage.from('main').remove([editingImage.imagePath]);
        }

        const { error: uploadError } = await supabase.storage.from('main').upload(imagePath, data.image);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('main').getPublicUrl(imagePath);
        const imageUrl = publicUrlData.publicUrl;

        const contentDocRef = doc(db, "siteContent", "main");
        await updateDoc(contentDocRef, {
            [`images.${editingImage.id}`]: {
                ...editingImage,
                imageUrl,
                imagePath,
                imageHint: data.imageHint,
            }
        });
        
        toast({ title: "Image Updated Successfully" });
        setIsDialogOpen(false);
        reset();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialImageSlots.map(slot => {
            const image = images[slot.id] || slot;
            return (
              <Card key={image.id}>
                <CardHeader>
                  <CardTitle>{image.name}</CardTitle>
                  <CardDescription>{image.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                    <Image src={image.imageUrl} alt={image.name} fill className="object-cover" />
                  </div>
                </CardContent>
                <CardContent>
                  <Button onClick={() => handleOpenDialog(image)} className="w-full"><Edit className="mr-2 h-4 w-4" /> Change Image</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit: {editingImage?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Image Upload</Label>
              <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-secondary/50 flex-shrink-0">
                      {preview ? <Image src={preview} alt="Preview" width={96} height={96} className="object-contain" /> : <UploadCloud className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <Input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" />
              </div>
              {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageHint">Image Hint (for AI)</Label>
              <Input id="imageHint" {...register("imageHint")} />
              {errors.imageHint && <p className="text-sm text-destructive">{errors.imageHint.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
