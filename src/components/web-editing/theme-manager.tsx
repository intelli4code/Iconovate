
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
    {
        name: "Default",
        id: "theme-default",
        colors: ["#7C3AED", "#1E1B4B", "#EC4899"],
    },
    {
        name: "Moonstone",
        id: "theme-moonstone",
        colors: ["#239EAB", "#0B2C24", "#74DEEE"],
    },
    {
        name: "Verdant",
        id: "theme-verdant",
        colors: ["#1C603F", "#0B2C24", "#247A4D"],
    },
    {
        name: "Fiery",
        id: "theme-fiery",
        colors: ["#CD1818", "#4A0404", "#F89B29"],
    },
];

export function ThemeManager() {
    const { toast } = useToast();
    const [activeTheme, setActiveTheme] = useState("theme-default");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const contentDocRef = doc(db, "siteContent", "main");
        const unsubscribe = onSnapshot(contentDocRef, async (docSnap) => {
            if (docSnap.exists() && docSnap.data().theme) {
                setActiveTheme(docSnap.data().theme);
            } else {
                // If the theme field doesn't exist, create it with the default
                await updateDoc(contentDocRef, { theme: "theme-default" }, { merge: true });
                setActiveTheme("theme-default");
            }
            setLoading(false);
        }, () => {
            toast({ variant: "destructive", title: "Failed to load theme data." });
            setLoading(false);
        });
        return () => unsubscribe();
    }, [toast]);

    const handleThemeChange = async (themeId: string) => {
        setIsSubmitting(themeId);
        try {
            await updateDoc(doc(db, "siteContent", "main"), { theme: themeId });
            toast({ title: "Theme Updated!", description: "Your website's color palette has been changed." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsSubmitting(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {themes.map((theme) => {
                const isActive = activeTheme === theme.id;
                return (
                    <Card key={theme.id} className={cn("overflow-hidden", isActive && "ring-2 ring-primary")}>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">{theme.name}</h3>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex h-16 w-full rounded-md overflow-hidden border">
                                {theme.colors.map((color) => (
                                    <div key={color} style={{ backgroundColor: color }} className="h-full w-1/3" />
                                ))}
                            </div>
                            <Button
                                onClick={() => handleThemeChange(theme.id)}
                                disabled={!!isSubmitting}
                                className="w-full"
                                variant={isActive ? "default" : "secondary"}
                            >
                                {isSubmitting === theme.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isActive ? <Check className="mr-2 h-4 w-4"/> : null}
                                {isActive ? "Active" : "Activate"}
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
