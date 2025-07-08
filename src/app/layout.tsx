
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from '@/contexts/loading-context';
import { ThemeProvider } from "@/contexts/theme-provider";
import { TopLoader } from '@/components/ui/top-loader';
import { NavigationEvents } from '@/components/navigation-events';

export const metadata: Metadata = {
  title: 'BrandBoost AI',
  description: 'AI-Powered Brand Design Automation Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <LoadingProvider>
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
