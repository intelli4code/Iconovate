
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import type { FooterContent, FooterColumn, FooterLink, SocialLink } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import * as LucideIcons from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Trash2, PlusCircle } from "lucide-react";

const socialLinkSchema = z.object({
    id: z.string(),
    platform: z.string().min(1, "Platform is required"),
    url: z.string().url("Must be a valid URL"),
});

const footerContentSchema = z.object({
  description: z.string().min(10, "Description is required"),
  socials: z.array(socialLinkSchema),
});

type FooterFormValues = z.infer<typeof footerContentSchema>;

const initialFooterData: FooterContent = {
    description: "AI-Powered Brand Research, Automated Logo Presentations, and Instant Brand Guideline Generation.",
    columns: [
        { id: 'quick-links', title: 'Quick Links', order: 1, links: [
            { id: uuidv4(), text: 'About', href: '/about' },
            { id: uuidv4(), text: 'Services', href: '/services' },
            { id: uuidv4(), text: 'Work', href: '/portfolio' },
        ]},
        { id: 'company', title: 'Company', order: 2, links: [
            { id: uuidv4(), text: 'Team', href: '/team' },
            { id: uuidv4(), text: 'Contact Us', href: '/contact' },
        ]},
        { id: 'portals', title: 'Portals', order: 3, links: [
            { id: uuidv4(), text: 'Client Portal', href: '/client-login' },
            { id: uuidv4(), text: 'Designer Portal', href: '/designer/login' },
        ]},
    ],
    socials: [
        { id: uuidv4(), platform: "Twitter", url: "#" },
        { id: uuidv4(), platform: "Github", url: "#" },
        { id: uuidv4(), platform: "Linkedin", url: "#" },
        { id: uuidv4(), platform: "Instagram", url: "#" },
        { id: uuidv4(), platform: "Facebook", url: "#" },
    ]
};

export function FooterManager() {
  const { toast } = useToast();
  const [footerData, setFooterData] = useState<FooterContent | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FooterFormValues>({
    resolver: zodResolver(footerContentSchema),
    defaultValues: {
        description: "",
        socials: [],
    }
  });

  const { fields, append, remove, update } = useFieldArray({
      control,
      name: "socials",
  });

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, async (docSnap) => {
      if (docSnap.exists() && docSnap.data().footer) {
        const data = docSnap.data().footer as FooterContent;
        data.columns.sort((a, b) => a.order - b.order);
        setFooterData(data);
        reset({ description: data.description, socials: data.socials });
      } else {
        await updateDoc(contentDocRef, { footer: initialFooterData });
        setFooterData(initialFooterData);
        reset({ description: initialFooterData.description, socials: initialFooterData.socials });
      }
      setLoading(false);
    }, () => {
      toast({ variant: "destructive", title: "Failed to load footer data." });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast, reset]);

  const onDescriptionSubmit = async (data: FooterFormValues) => {
    if (!footerData) return;
    try {
        const updatedFooter = { ...footerData, description: data.description, socials: data.socials };
        await updateDoc(doc(db, "siteContent", "main"), { footer: updatedFooter });
        toast({ title: "Footer content updated!" });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };


  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <form onSubmit={handleSubmit(onDescriptionSubmit)} className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Footer Content & Socials</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="description">Footer Description</Label>
                        <Textarea id="description" {...register("description")} />
                        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>
                    <div>
                        <Label>Social Media Links</Label>
                        <div className="space-y-2">
                            {fields.map((field, index) => {
                                const Icon = (LucideIcons as any)[field.platform] || LucideIcons.Link;
                                return (
                                <div key={field.id} className="flex gap-2 items-end p-2 border rounded-md">
                                    <div className="p-2 border rounded-md bg-muted"><Icon className="h-5 w-5"/></div>
                                    <div className="flex-1">
                                        <Label className="text-xs">Platform</Label>
                                        <Input {...register(`socials.${index}.platform`)} />
                                    </div>
                                    <div className="flex-1">
                                         <Label className="text-xs">URL</Label>
                                        <Input {...register(`socials.${index}.url`)} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            )})}
                        </div>
                        <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => append({ id: uuidv4(), platform: "Link", url: "" })}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Social
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Save Footer Content"}
            </Button>
        </form>
      )}
    </>
  );
}
