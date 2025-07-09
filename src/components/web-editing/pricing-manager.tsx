
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import type { PricingTier } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Edit, Check } from "lucide-react";

const pricingSchema = z.object({
  price: z.string().min(1, "Price is required"),
  priceDescription: z.string().min(1, "Price description is required"),
  description: z.string().min(10, "Description is required"),
  features: z.string().min(10, "At least one feature is required"),
  isPopular: z.boolean().default(false),
});

type PricingFormValues = z.infer<typeof pricingSchema>;

export function PricingManager() {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
  });

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "pricingTiers"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTiers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PricingTier)));
      setLoading(false);
    }, (error) => {
      toast({ variant: "destructive", title: "Failed to load pricing tiers." });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleOpenDialog = (tier: PricingTier) => {
    setEditingTier(tier);
    reset({
      price: tier.price,
      priceDescription: tier.priceDescription,
      description: tier.description,
      features: tier.features.join('\n'),
      isPopular: tier.isPopular,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: PricingFormValues) => {
    if (!editingTier) return;
    try {
      const tierRef = doc(db, "pricingTiers", editingTier.id);
      await updateDoc(tierRef, {
        ...data,
        features: data.features.split('\n').filter(f => f.trim() !== ''),
      });
      toast({ title: "Pricing Tier Updated" });
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tiers.map(tier => (
            <Card key={tier.id}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.priceDescription}</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardContent>
                <Button onClick={() => handleOpenDialog(tier)} className="w-full">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit: {editingTier?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" {...register("price")} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceDescription">Price Description</Label>
                <Input id="priceDescription" {...register("priceDescription")} />
                {errors.priceDescription && <p className="text-sm text-destructive">{errors.priceDescription.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Tier Description</Label>
              <Input id="description" {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea id="features" {...register("features")} rows={5} />
              {errors.features && <p className="text-sm text-destructive">{errors.features.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isPopular" checked={control._formValues.isPopular} onCheckedChange={(checked) => setValue("isPopular", checked)} />
              <Label htmlFor="isPopular">Mark as Popular?</Label>
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
