
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import type { Testimonial } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2, Edit, Star } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const testimonialSchema = z.object({
  name: z.string().min(2, "Name is required"),
  review: z.string().min(10, "Review is required"),
  rating: z.coerce.number().min(1).max(5),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export function TestimonialsManager() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
  });

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "testimonials"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
      setLoading(false);
    }, () => {
      toast({ variant: "destructive", title: "Failed to load testimonials." });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleOpenDialog = (item: Testimonial | null = null) => {
    if (item) {
      setEditingItem(item);
      reset({ name: item.name, review: item.review, rating: item.rating });
    } else {
      setEditingItem(null);
      reset({ name: "", review: "", rating: 5 });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: TestimonialFormValues) => {
    const itemData = {
        ...data,
        // Using placeholder for image as we don't have a way to upload it here
        src: 'https://placehold.co/40x40.png',
        hint: 'person portrait',
    };
    try {
      if (editingItem) {
        await updateDoc(doc(db, "testimonials", editingItem.id), itemData);
        toast({ title: "Testimonial Updated" });
      } else {
        await addDoc(collection(db, "testimonials"), { ...itemData, order: testimonials.length + 1, createdAt: serverTimestamp() });
        toast({ title: "Testimonial Added" });
      }
      setIsDialogOpen(false);
      reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "testimonials", id));
      toast({ title: "Testimonial Deleted" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Testimonial
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(item => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                 <Avatar className="h-12 w-12">
                  <AvatarImage src={item.src} data-ai-hint={item.hint} />
                  <AvatarFallback>{item.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn('h-4 w-4', item.rating > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">"{item.review}"</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will delete the testimonial from {item.name}.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
           {testimonials.length === 0 && <p className="col-span-full text-center text-muted-foreground p-8">No testimonials created yet.</p>}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Testimonial</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="review">Review Text</Label>
              <Textarea id="review" {...register("review")} rows={4}/>
              {errors.review && <p className="text-sm text-destructive">{errors.review.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input id="rating" type="number" min="1" max="5" {...register("rating")} />
              {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
