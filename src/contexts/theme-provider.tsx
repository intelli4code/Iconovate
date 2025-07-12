"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [themeClass, setThemeClass] = React.useState("theme-default");

  React.useEffect(() => {
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().theme) {
            setThemeClass(docSnap.data().theme);
        } else {
            setThemeClass("theme-default");
        }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const htmlElement = document.documentElement;
    
    // Remove any existing theme classes
    htmlElement.classList.forEach(className => {
        if (className.startsWith('theme-')) {
            htmlElement.classList.remove(className);
        }
    });

    // Add the new theme class
    if (themeClass) {
        htmlElement.classList.add(themeClass);
    }
  }, [themeClass]);


  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
