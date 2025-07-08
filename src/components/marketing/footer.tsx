import { LoadingLink } from "@/components/ui/loading-link";
import { Button } from "@/components/ui/button";
import { Rocket, Twitter, Linkedin, Github } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <LoadingLink href="/" className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline text-lg">
                BrandBoost AI
              </span>
            </LoadingLink>
            <p className="text-sm text-muted-foreground">
              Design Meets Intelligence. We build beautiful, AI-supercharged brands and websites.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><LoadingLink href="/about" className="text-muted-foreground hover:text-foreground">About Us</LoadingLink></li>
              <li><LoadingLink href="/services" className="text-muted-foreground hover:text-foreground">Services</LoadingLink></li>
              <li><LoadingLink href="/portfolio" className="text-muted-foreground hover:text-foreground">Portfolio</LoadingLink></li>
              <li><LoadingLink href="/contact" className="text-muted-foreground hover:text-foreground">Contact</LoadingLink></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li><LoadingLink href="/client-login" className="text-muted-foreground hover:text-foreground">Client Portal</LoadingLink></li>
              <li><LoadingLink href="/designer/login" className="text-muted-foreground hover:text-foreground">Designer Portal</LoadingLink></li>
              <li><LoadingLink href="/login" className="text-muted-foreground hover:text-foreground">Admin Login</LoadingLink></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Get a Quote</h3>
            <p className="text-sm text-muted-foreground mb-4">Ready to start your project? Let's talk.</p>
            <Button asChild>
                <LoadingLink href="/contact">Contact Us</LoadingLink>
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BrandBoost AI. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
             <a href="#" className="hover:text-foreground"><Twitter className="h-5 w-5" /></a>
             <a href="#" className="hover:text-foreground"><Github className="h-5 w-5" /></a>
             <a href="#" className="hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
