"use client";

import { MarketingHeader } from '@/components/marketing/header';

export default function MarketingLayoutWrapper({
  children,
  footer
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {

  return (
    <div className="relative isolate flex min-h-screen flex-col font-body text-foreground bg-background">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50">
        {footer}
      </footer>
    </div>
  );
}
