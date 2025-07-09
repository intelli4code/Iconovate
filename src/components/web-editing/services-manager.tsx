
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import type { Service } from "@/types";
import { useToast } from "@/hooks/use-toast";
import * as LucideIcons from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Loader2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const serviceSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  icon: z.string().min(1, "An icon is required"),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const iconNames = [
    'Palette', 'PenTool', 'BrainCircuit', 'Briefcase', 'BookText',
    'ShieldCheck', 'Zap', 'Star', 'Megaphone', 'Presentation',
    'Brush', 'Code', 'Globe', 'Camera', 'Video', 'MessageSquare',
    'Users', 'Settings', 'BarChart', 'Layers'
];


export function ServicesManager() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
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
    try {
      if (editingService) {
        await updateDoc(doc(db, "services", editingService.id), data);
        toast({ title: "Service Updated" });
      } else {
        await addDoc(collection(db, "services"), { ...data, order: services.length + 1, createdAt: serverTimestamp() });
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
              <Label>Icon</Label>
              <Select onValueChange={(value) => setValue("icon", value, { shouldValidate: true })} defaultValue={editingService?.icon}>
                <SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger>
                <SelectContent>
                  {iconNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                </SelectContent>
              </Select>
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
