
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from '@/contexts/loading-context';
import { ThemeProvider } from "@/contexts/theme-provider";
import { TopLoader } from '@/components/ui/top-loader';
import { NavigationEvents } from '@/components/navigation-events';
import CustomCursor from '@/components/custom-cursor';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const metadata: Metadata = {
  title: 'BrandBoost AI',
  description: 'AI-Powered Brand Design Automation Platform',
};

async function getSiteTheme() {
    try {
        const contentDocRef = doc(db, "siteContent", "main");
        const docSnap = await getDoc(contentDocRef);
        if (docSnap.exists() && docSnap.data().theme) {
            return docSnap.data().theme;
        }
        return "theme-default"; // Default theme
    } catch (error) {
        console.error("Failed to fetch site theme, using default.", error);
        return "theme-default";
    }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteTheme = await getSiteTheme();

  return (
    <html lang="en" suppressHydrationWarning className={siteTheme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
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
