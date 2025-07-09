
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import type { FooterColumn, FooterLink } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Trash2, PlusCircle } from "lucide-react";

const linkSchema = z.object({
  text: z.string().min(1, "Text is required"),
  href: z.string().min(1, "URL path is required (e.g., /about)"),
});
type LinkFormValues = z.infer<typeof linkSchema>;

const initialFooterData: FooterColumn[] = [
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
        { id: uuidv4(), text: 'Admin Login', href: '/login' },
    ]},
];

export function FooterManager() {
  const { toast } = useToast();
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
  });

  useEffect(() => {
    setLoading(true);
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, async (docSnap) => {
      if (docSnap.exists() && docSnap.data().footerColumns) {
        setColumns(docSnap.data().footerColumns.sort((a: FooterColumn, b: FooterColumn) => a.order - b.order));
      } else {
        await updateDoc(contentDocRef, { footerColumns: initialFooterData });
        setColumns(initialFooterData);
      }
      setLoading(false);
    }, () => {
      toast({ variant: "destructive", title: "Failed to load footer data." });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleOpenDialog = (columnId: string, link: FooterLink | null = null) => {
    setEditingColumnId(columnId);
    setEditingLink(link);
    if (link) {
      reset({ text: link.text, href: link.href });
    } else {
      reset({ text: "", href: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: LinkFormValues) => {
    if (!editingColumnId) return;
    const newColumns = columns.map(col => {
      if (col.id === editingColumnId) {
        let newLinks;
        if (editingLink) {
          newLinks = col.links.map(l => l.id === editingLink.id ? { ...l, ...data } : l);
        } else {
          newLinks = [...col.links, { ...data, id: uuidv4() }];
        }
        return { ...col, links: newLinks };
      }
      return col;
    });

    try {
      await updateDoc(doc(db, "siteContent", "main"), { footerColumns: newColumns });
      toast({ title: "Footer updated" });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const handleDelete = async (columnId: string, linkId: string) => {
    const newColumns = columns.map(col => {
        if (col.id === columnId) {
            return { ...col, links: col.links.filter(l => l.id !== linkId) };
        }
        return col;
    });

    try {
        await updateDoc(doc(db, "siteContent", "main"), { footerColumns: newColumns });
        toast({ title: "Link removed" });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
      }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {columns.map(col => (
            <Card key={col.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{col.title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(col.id)}><PlusCircle className="mr-2 h-4 w-4"/>Add Link</Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-secondary/50">
                      <div>
                        <p>{link.text}</p>
                        <p className="text-xs text-muted-foreground">{link.href}</p>
                      </div>
                      <div className="flex">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(col.id, link)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(col.id, link.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingLink ? "Edit" : "Add"} Footer Link</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Link Text</Label>
              <Input id="text" {...register("text")} />
              {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="href">URL Path</Label>
              <Input id="href" {...register("href")} placeholder="/example" />
              {errors.href && <p className="text-sm text-destructive">{errors.href.message}</p>}
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
