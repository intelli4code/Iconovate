"use client"

import { useState, useEffect } from "react";
import { LoadingLink } from "@/components/ui/loading-link";
import { Button } from "@/components/ui/button";
import { Rocket, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function MarketingHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

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
            "transition-colors hover:text-foreground/80",
            pathname === link.href ? "text-foreground" : "text-foreground/60"
          )}
        >
          {link.label}
        </LoadingLink>
      ))}
    </>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled ? "border-b bg-background/80 backdrop-blur-sm" : "bg-transparent"
    )}>
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <LoadingLink href="/" className="mr-6 flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              BrandBoost AI
            </span>
          </LoadingLink>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavItems />
          </nav>
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
             <LoadingLink href="/" className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline">BrandBoost AI</span>
            </LoadingLink>
            <div className="my-4 h-px w-full bg-border" />
            <div className="flex flex-col space-y-4">
              <NavItems />
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Mobile Logo */}
        <LoadingLink href="/" className="flex items-center space-x-2 md:hidden">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">BrandBoost AI</span>
        </LoadingLink>


        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <Button asChild>
            <LoadingLink href="/client-login">Client Portal</LoadingLink>
          </Button>
        </div>
      </div>
    </header>
  );
}
