
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import type { FeaturePoint } from "@/types";
import { useToast } from "@/hooks/use-toast";
import * as LucideIcons from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const featurePointSchema = z.object({
  title: z.string().min(3, "Title is required"),
  text: z.string().min(10, "Text is required"),
  icon: z.string().min(1, "An icon name from lucide-react is required"),
  link: z.string().min(1, "Link is required (e.g., /services)"),
});

type FeaturePointFormValues = z.infer<typeof featurePointSchema>;

const initialFeaturePoints: Omit<FeaturePoint, 'id'>[] = [
  { title: "Stay focused on your creative vision", text: "Our AI handles the tedious parts of brand research and asset generation, letting you focus on high-impact creative work that drives results.", icon: "ShieldCheck", link: "/services", order: 1 },
  { title: "Generate Assets Instantly", text: "From logos to mockups and full brand guidelines, our AI tools produce high-quality assets in a fraction of the time.", icon: "Zap", link: "/services", order: 2 },
  { title: "Collaborate Seamlessly", text: "Use our client portals to share progress, gather feedback, and deliver final assets, all in one place.", icon: "Users", link: "/contact", order: 3 },
];

export function FeaturePointsManager() {
  const { toast } = useToast();
  const [featurePoints, setFeaturePoints] = useState<FeaturePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeaturePoint | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FeaturePointFormValues>({
    resolver: zodResolver(featurePointSchema),
  });

  const iconName = watch("icon");
  const IconPreview = (LucideIcons as any)[iconName] || null;

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, async (docSnap) => {
        if (docSnap.exists() && docSnap.data().featurePoints) {
            setFeaturePoints((docSnap.data().featurePoints as FeaturePoint[]).sort((a,b) => a.order - b.order));
        } else {
            await updateDoc(contentDocRef, { featurePoints: initialFeaturePoints }, { merge: true });
            setFeaturePoints(initialFeaturePoints);
        }
        setLoading(false);
    }, () => {
        toast({ variant: "destructive", title: "Failed to load feature points." });
        setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleOpenDialog = (item: FeaturePoint | null = null) => {
    if (item) {
      setEditingItem(item);
      reset(item);
    } else {
      setEditingItem(null);
      reset({ title: "", text: "", icon: "", link: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: FeaturePointFormValues) => {
    if (!(LucideIcons as any)[data.icon]) {
        toast({ variant: "destructive", title: "Invalid Icon", description: "Please provide a valid icon name from Lucide React." });
        return;
    }

    let updatedPoints: FeaturePoint[];
    if (editingItem) {
        updatedPoints = featurePoints.map(p => p.id === editingItem.id ? { ...editingItem, ...data } : p);
    } else {
        const newItem: FeaturePoint = { ...data, id: uuidv4(), order: featurePoints.length + 1 };
        updatedPoints = [...featurePoints, newItem];
    }
    
    try {
        await updateDoc(doc(db, "siteContent", "main"), { featurePoints: updatedPoints });
        toast({ title: editingItem ? "Feature Point Updated" : "Feature Point Added" });
        setIsDialogOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    const updatedPoints = featurePoints.filter(p => p.id !== id);
    try {
      await updateDoc(doc(db, "siteContent", "main"), { featurePoints: updatedPoints });
      toast({ title: "Feature Point Deleted" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Feature Point
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featurePoints.map(point => {
            const Icon = (LucideIcons as any)[point.icon] || LucideIcons.HelpCircle;
            return (
              <Card key={point.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary flex-shrink-0"><Icon className="h-6 w-6" /></div>
                    <CardTitle className="pt-2">{point.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{point.text}</p>
                </CardContent>
                 <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(point)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete this feature point.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(point.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
              </Card>
            );
          })}
           {featurePoints.length === 0 && <p className="col-span-full text-center text-muted-foreground p-8">No feature points created yet.</p>}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Feature Point</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Textarea id="text" {...register("text")} />
              {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="icon">Icon Name</Label>
              <div className="flex items-center gap-2">
                <Input id="icon" {...register("icon")} placeholder="e.g., Zap, ShieldCheck" />
                <div className="p-2 border rounded-md">
                    {IconPreview ? <IconPreview className="h-5 w-5" /> : <LucideIcons.HelpCircle className="h-5 w-5 text-muted-foreground"/>}
                </div>
              </div>
               <p className="text-xs text-muted-foreground">Provide a valid icon name from the <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">Lucide React</a> library.</p>
              {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="link">Learn More Link</Label>
              <Input id="link" {...register("link")} placeholder="/services" />
              {errors.link && <p className="text-sm text-destructive">{errors.link.message}</p>}
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
