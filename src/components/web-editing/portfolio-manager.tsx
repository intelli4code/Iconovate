

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2, Edit, UploadCloud } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const portfolioSchema = z.object({
  title: z.string().min(3, "Title is required"),
  category: z.string().min(3, "Category is required"),
  description: z.string().min(10, "Description is required"),
  content: z.string().min(20, "Content for the dialog is required"),
  imageHint: z.string().min(2, "Image hint is required"),
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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
  });

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
        imageHint: item.imageHint,
      });
      setPreview(item.imageUrl);
    } else {
      setEditingItem(null);
      reset({ title: "", category: "", description: "", content: "", imageHint: "" });
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
        imageHint: data.imageHint,
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No portfolio items found.</TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image src={item.imageUrl} alt={item.title} width={48} height={48} className="rounded-md object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete "{item.title}". This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Portfolio Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
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
             <div className="space-y-2">
                <Label htmlFor="description">Short Description (for card)</Label>
                <Textarea id="description" {...register("description")} rows={2} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="content">Full Content (for dialog)</Label>
                <Textarea id="content" {...register("content")} rows={5} />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="imageHint">Image Hint (for AI)</Label>
                <Input id="imageHint" {...register("imageHint")} />
                {errors.imageHint && <p className="text-sm text-destructive">{errors.imageHint.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingItem ? "Save Changes" : "Add Item")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
