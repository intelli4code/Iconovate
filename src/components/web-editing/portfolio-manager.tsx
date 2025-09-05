

"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import type { PortfolioItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2, Edit, UploadCloud } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const portfolioSchema = z.object({
  title: z.string().min(3, "Title is required"),
  category: z.string().min(3, "Category is required"),
  description: z.string().min(10, "Description is required"),
  content: z.string().min(20, "Content for the dialog is required"),
  aspectRatio: z.enum(['1:1', '16:9', '9:16']).default('1:1'),
  image: z.any().optional(),
});

type PortfolioFormValues = z.infer<typeof portfolioSchema>;

export function PortfolioManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
  });
  
  const categories = ["All", ...Array.from(new Set(items.map(item => item.category)))];
  
  const filteredItems = activeCategory === "All"
    ? items
    : items.filter(item => item.category === activeCategory);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (item: PortfolioItem | null = null) => {
    if (item) {
      setEditingItem(item);
      reset({
        title: item.title,
        category: item.category,
        description: item.description,
        content: item.content,
        aspectRatio: item.aspectRatio || '1:1',
      });
      setPreview(item.imageUrl);
    } else {
      setEditingItem(null);
      reset({ title: "", category: "", description: "", content: "", aspectRatio: '1:1' });
      setPreview(null);
    }
    setIsDialogOpen(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      if(file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null); // No preview for non-image files like PDFs
      }
    }
  };

  const onSubmit = async (data: PortfolioFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = editingItem?.imageUrl || "";
      let imagePath = editingItem?.imagePath || "";
      let fileType: 'image' | 'pdf' = editingItem?.fileType || 'image';

      const file = data.image as File;

      if (file instanceof File) {
        if (!supabase) throw new Error("Supabase not configured for file uploads.");
        
        const newImagePath = `portfolio/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('main').upload(newImagePath, file);
        if (uploadError) throw uploadError;

        imagePath = newImagePath;
        const { data: publicUrlData } = supabase.storage.from('main').getPublicUrl(newImagePath);
        imageUrl = publicUrlData.publicUrl;
        fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

      } else if (!editingItem) {
        throw new Error("A file (image or PDF) is required for new portfolio items.");
      }

      const itemData = {
        title: data.title,
        category: data.category,
        description: data.description,
        content: data.content,
        aspectRatio: data.aspectRatio,
        imageUrl,
        imagePath,
        fileType,
      };

      if (editingItem) {
        await updateDoc(doc(db, "portfolioItems", editingItem.id), itemData);
        toast({ title: "Portfolio Item Updated" });
      } else {
        await addDoc(collection(db, "portfolioItems"), { ...itemData, createdAt: serverTimestamp() });
        toast({ title: "Portfolio Item Added" });
      }

      setIsDialogOpen(false);
      reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: PortfolioItem) => {
    try {
      if (item.imagePath && supabase) {
        await supabase.storage.from('main').remove([item.imagePath]);
      }
      await deleteDoc(doc(db, "portfolioItems", item.id));
      toast({ title: "Item Deleted" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Portfolio Items</CardTitle>
            <CardDescription>The projects displayed on your public website.</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : filteredItems.length === 0 ? (
            <p className="text-center text-muted-foreground p-8">No portfolio items found for this category.</p>
        ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden group">
                        <CardContent className="p-0">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <Image
                                    src={item.imageUrl}
                                    alt={`Portfolio piece for ${item.title}`}
                                    width={600}
                                    height={400}
                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-primary font-semibold">{item.category}</p>
                                <h3 className="mt-1 text-lg font-bold truncate">{item.title}</h3>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 bg-muted/50 p-2">
                             <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{item.title}". This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}

      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Portfolio Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image or PDF File</Label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-secondary/50 flex-shrink-0">
                        {preview ? ( <Image src={preview} alt="Preview" width={96} height={96} className="object-contain" /> ) : ( <UploadCloud className="h-8 w-8 text-muted-foreground" /> )}
                    </div>
                    <Input id="image-upload" type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
                </div>
                {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message as string}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" {...register("category")} />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="description">Short Description (for card)</Label>
                  <Textarea id="description" {...register("description")} rows={3} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="content">Full Content (for dialog)</Label>
                  <Textarea id="content" {...register("content")} rows={3} />
                  {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Controller
                  name="aspectRatio"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-3 gap-2">
                      <Label className="border cursor-pointer rounded-md p-2 flex items-center justify-center text-sm [&:has(:checked)]:bg-primary [&:has(:checked)]:text-primary-foreground">
                        <RadioGroupItem value="1:1" className="sr-only" /> 1:1
                      </Label>
                      <Label className="border cursor-pointer rounded-md p-2 flex items-center justify-center text-sm [&:has(:checked)]:bg-primary [&:has(:checked)]:text-primary-foreground">
                        <RadioGroupItem value="16:9" className="sr-only" /> 16:9
                      </Label>
                      <Label className="border cursor-pointer rounded-md p-2 flex items-center justify-center text-sm [&:has(:checked)]:bg-primary [&:has(:checked)]:text-primary-foreground">
                        <RadioGroupItem value="9:16" className="sr-only" /> 9:16
                      </Label>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
             <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingItem ? "Save Changes" : "Add Item")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
