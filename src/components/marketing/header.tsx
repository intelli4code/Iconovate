
"use client";

import { useState, useEffect } from "react";
import { LoadingLink } from "@/components/ui/loading-link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { SiteIdentity } from "@/types";
import Image from "next/image";

export function MarketingHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [identity, setIdentity] = useState<SiteIdentity | null>(null);

  useEffect(() => {
    const contentDocRef = doc(db, "siteContent", "main");
    const unsubscribe = onSnapshot(contentDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().identity) {
            setIdentity(docSnap.data().identity);
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/team", label: "Team" },
    { href: "/contact", label: "Contact" },
  ];

  const NavItems = () => (
    <>
      {navLinks.map((link) => (
        <LoadingLink
          key={link.href}
          href={link.href}
          className={cn(
            "transition-colors hover:text-primary",
            pathname === link.href ? "text-primary" : "text-foreground/80"
          )}
        >
          {link.label}
        </LoadingLink>
      ))}
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        isScrolled
          ? "border-border/50 bg-background/80 backdrop-blur-sm"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center space-x-6">
          <LoadingLink href="/" className="flex items-center space-x-2">
            {identity?.logoUrl ? (
                <Image src={identity.logoUrl} alt="Site Logo" width={120} height={40} className="object-contain h-8" />
            ) : (
                <div className="h-6 w-24 bg-muted rounded-md animate-pulse" />
            )}
          </LoadingLink>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <NavItems />
          </nav>
        </div>

        {/* Right: Action Buttons + Theme Toggle */}
        <div className="hidden md:flex items-center space-x-2">
          <Button asChild variant="ghost" className="rounded-full">
            <LoadingLink href="/designer/login">Designer Portal</LoadingLink>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <LoadingLink href="/client-login">Client Portal</LoadingLink>
          </Button>
          <Button asChild className="rounded-full">
            <LoadingLink href="/contact">Start Project</LoadingLink>
          </Button>
          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile: Theme Toggle + Menu */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="ml-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <LoadingLink href="/" className="flex items-center space-x-2">
                 {identity?.logoUrl ? (
                    <Image src={identity.logoUrl} alt="Site Logo" width={120} height={40} className="object-contain h-8" />
                ) : (
                    <div className="h-6 w-24 bg-muted rounded-md animate-pulse" />
                )}
              </LoadingLink>
              <div className="my-4 h-px w-full bg-border" />
              <div className="flex flex-col space-y-4">
                <NavItems />
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button asChild variant="outline">
                    <LoadingLink href="/designer/login">
                      Designer Portal
                    </LoadingLink>
                  </Button>
                  <Button asChild variant="outline">
                    <LoadingLink href="/client-login">Client Portal</LoadingLink>
                  </Button>
                  <Button asChild>
                    <LoadingLink href="/contact">
                      Start Project
                    </LoadingLink>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
