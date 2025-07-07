
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from '@/contexts/loading-context';
import { PageLoader } from '@/components/ui/page-loader';
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
    <html lang="en" className="dark" style={{colorScheme: "dark"}}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LoadingProvider>
            {children}
            <PageLoader />
            <NavigationEvents />
        </LoadingProvider>
        <Toaster />
      </body>
    </html>
  );
}
