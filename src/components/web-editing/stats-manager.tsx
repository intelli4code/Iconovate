
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import type { SiteStat } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Loader2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statSchema = z.object({
  label: z.string().min(3, "Label is required"),
  value: z.string().min(1, "Value is required"),
});

type StatFormValues = z.infer<typeof statSchema>;

const initialStats: Omit<SiteStat, 'id'>[] = [
    { label: "Lessons Completed", value: "12K+", order: 1 },
    { label: "Countries Learning", value: "80+", order: 2 },
    { label: "Brands Boosted", value: "99+", order: 3 },
    { label: "Certificates Issued", value: "10K+", order: 4 },
];

export function StatsManager() {
  const { toast } = useToast();
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SiteStat | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StatFormValues>({
    resolver: zodResolver(statSchema),
  });

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, async (docSnap) => {
        if (docSnap.exists() && docSnap.data().stats) {
            setStats((docSnap.data().stats as SiteStat[]).sort((a, b) => a.order - b.order));
        } else {
            await updateDoc(contentDocRef, { stats: initialStats }, { merge: true });
            setStats(initialStats.map(s => ({...s, id: uuidv4() })));
        }
        setLoading(false);
    }, () => {
        toast({ variant: "destructive", title: "Failed to load stats." });
        setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleOpenDialog = (item: SiteStat | null = null) => {
    if (item) {
      setEditingItem(item);
      reset(item);
    } else {
      setEditingItem(null);
      reset({ label: "", value: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: StatFormValues) => {
    let updatedStats: SiteStat[];
    if (editingItem) {
        updatedStats = stats.map(s => s.id === editingItem.id ? { ...editingItem, ...data } : s);
    } else {
        const newItem: SiteStat = { ...data, id: uuidv4(), order: stats.length + 1 };
        updatedStats = [...stats, newItem];
    }
    
    try {
        await updateDoc(doc(db, "siteContent", "main"), { stats: updatedStats });
        toast({ title: editingItem ? "Stat Updated" : "Stat Added" });
        setIsDialogOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    const updatedStats = stats.filter(s => s.id !== id);
    try {
      await updateDoc(doc(db, "siteContent", "main"), { stats: updatedStats });
      toast({ title: "Stat Deleted" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Stat
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => (
              <Card key={stat.id}>
                <CardHeader>
                  <CardTitle className="text-4xl text-primary font-bold">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{stat.label}</CardDescription>
                </CardContent>
                 <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(stat)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete this statistic.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(stat.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
              </Card>
            )
          )}
           {stats.length === 0 && <p className="col-span-full text-center text-muted-foreground p-8">No stats created yet.</p>}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Stat</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input id="value" {...register("value")} placeholder="e.g., 12K+"/>
              {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" {...register("label")} placeholder="e.g., Brands Boosted"/>
              {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
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
