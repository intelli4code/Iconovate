
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import type { BackgroundEffects } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

const effectsSchema = z.object({
  animate: z.boolean().default(true),
  count: z.number().min(0).max(6).default(4),
});

type EffectsFormValues = z.infer<typeof effectsSchema>;

const initialEffects: BackgroundEffects = {
    animate: true,
    count: 4,
};

export function BackgroundEffectsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<EffectsFormValues>({
    resolver: zodResolver(effectsSchema),
    defaultValues: initialEffects,
  });
  
  const effectCount = watch('count');

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, async (docSnap) => {
      if (docSnap.exists() && docSnap.data().backgroundEffects) {
        reset(docSnap.data().backgroundEffects);
      } else {
        await updateDoc(contentDocRef, { backgroundEffects: initialEffects }, { merge: true });
        reset(initialEffects);
      }
      setLoading(false);
    }, () => {
      toast({ variant: "destructive", title: "Failed to load background settings." });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast, reset]);

  const onSubmit = async (data: EffectsFormValues) => {
    try {
      await updateDoc(doc(db, "siteContent", "main"), { backgroundEffects: data });
      toast({ title: "Background effects updated!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
                <CardTitle>Background Gradient Effects</CardTitle>
                <CardDescription>Control the appearance and motion of the background gradients on your marketing pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Animate Gradients</Label>
                        <p className="text-sm text-muted-foreground">Enable or disable the subtle background motion.</p>
                    </div>
                     <Switch
                        checked={watch('animate')}
                        onCheckedChange={(checked) => setValue('animate', checked)}
                      />
                </div>
                 <div className="rounded-lg border p-4">
                    <div className="space-y-0.5 mb-4">
                        <Label>Number of Gradients: {effectCount}</Label>
                        <p className="text-sm text-muted-foreground">Set how many gradient effects appear (0-6).</p>
                    </div>
                    <Slider
                        value={[effectCount]}
                        onValueChange={(value) => setValue('count', value[0])}
                        min={0}
                        max={6}
                        step={1}
                    />
                </div>
            </CardContent>
             <CardContent>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Background Settings"}
              </Button>
            </CardContent>
        </Card>
    </form>
  );
}
