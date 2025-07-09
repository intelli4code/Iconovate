
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import type { Service } from "@/types";
import { useToast } from "@/hooks/use-toast";
import * as LucideIcons from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const serviceSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  icon: z.string().min(1, "An icon name from lucide-react is required"),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const initialServices: Omit<Service, 'id'>[] = [
    { title: "Logo & Brand Identity", description: "Craft a memorable brand with a unique logo, color palette, and typography that tells your story.", icon: 'Palette', order: 1 },
    { title: "Web & UI/UX Design", description: "Create intuitive, beautiful, and user-friendly websites and applications that convert.", icon: 'PenTool', order: 2 },
    { title: "AI-Powered Brand Research", description: "Leverage AI for deep market insights, competitor analysis, and strategic brand positioning.", icon: 'BrainCircuit', order: 3 },
    { title: "Marketing Materials", description: "Design compelling brochures, flyers, social media graphics, and presentations that capture attention.", icon: 'Megaphone', order: 4 },
    { title: "Packaging Design", description: "Develop eye-catching packaging that stands out on the shelves and reflects your brand's quality.", icon: 'Box', order: 5 },
    { title: "Presentation Design", description: "Transform your ideas into stunning presentations that captivate and persuade your audience.", icon: 'Presentation', order: 6 },
];

export function ServicesManager() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  const iconName = watch("icon");
  const IconPreview = (LucideIcons as any)[iconName] || null;

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
            // Seed the database if it's empty
            const batch = writeBatch(db);
            initialServices.forEach(service => {
                const docRef = doc(collection(db, "services"));
                batch.set(docRef, service);
            });
            await batch.commit();
            // The listener will pick up the new data automatically.
        } else {
            setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
        }
        setLoading(false);
    }, () => {
        toast({ variant: "destructive", title: "Failed to load services." });
        setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleOpenDialog = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);
      reset({ title: service.title, description: service.description, icon: service.icon });
    } else {
      setEditingService(null);
      reset({ title: "", description: "", icon: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ServiceFormValues) => {
    if (!(LucideIcons as any)[data.icon]) {
        toast({ variant: "destructive", title: "Invalid Icon", description: "Please provide a valid icon name from the Lucide React library." });
        return;
    }
    try {
      if (editingService) {
        await updateDoc(doc(db, "services", editingService.id), data);
        toast({ title: "Service Updated" });
      } else {
        await addDoc(collection(db, "services"), { ...data, order: services.length + 1 });
        toast({ title: "Service Added" });
      }
      setIsDialogOpen(false);
      reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "services", id));
      toast({ title: "Service Deleted" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => {
            const Icon = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;
            return (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Icon className="h-8 w-8 text-primary" />
                      <CardTitle>{service.title}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(service)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete this service.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
           {services.length === 0 && <p className="col-span-full text-center text-muted-foreground p-8">No services created yet.</p>}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingService ? "Edit" : "Add"} Service</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon Name</Label>
              <div className="flex items-center gap-2">
                <Input id="icon" {...register("icon")} placeholder="e.g., Palette, PenTool" />
                <div className="p-2 border rounded-md">
                    {IconPreview ? <IconPreview className="h-5 w-5" /> : <LucideIcons.HelpCircle className="h-5 w-5 text-muted-foreground"/>}
                </div>
              </div>
               <p className="text-xs text-muted-foreground">Provide a valid icon name from the <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">Lucide React</a> library.</p>
              {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
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
