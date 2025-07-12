
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from '@/contexts/loading-context';
import { ThemeProvider } from "@/contexts/theme-provider";
import { TopLoader } from '@/components/ui/top-loader';
import { NavigationEvents } from '@/components/navigation-events';
import CustomCursor from '@/components/custom-cursor';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>BrandBoost AI</title>
        <meta name="description" content="AI-Powered Brand Design Automation Platform" />
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
