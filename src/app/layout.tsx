
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from '@/contexts/loading-context';
import { ThemeProvider } from "@/contexts/theme-provider";
import { TopLoader } from '@/components/ui/top-loader';
import { NavigationEvents } from '@/components/navigation-events';
import CustomCursor from '@/components/custom-cursor';
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { SiteIdentity } from '@/types';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [identity, setIdentity] = useState<SiteIdentity>({
    siteName: 'BrandBoost AI',
    siteDescription: 'AI-Powered Brand Design Automation Platform',
    siteKeywords: 'AI, branding, design, logo, automation',
    faviconUrl: '/favicon.ico',
  });

  useEffect(() => {
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().identity) {
            setIdentity(docSnap.data().identity);
        }
    });
    return () => unsubscribe();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{identity.siteName}</title>
        <meta name="description" content={identity.siteDescription} />
        <meta name="keywords" content={identity.siteKeywords} />
        <link rel="icon" href={identity.faviconUrl} sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
            <LoadingProvider>
                <CustomCursor />
                {children}
                <TopLoader />
                <NavigationEvents />
            </LoadingProvider>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
