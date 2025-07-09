import { LoadingLink } from "@/components/ui/loading-link";
import { Button } from "@/components/ui/button";
import { Rocket, Twitter, Linkedin, Github } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2 space-y-4">
            <LoadingLink href="/" className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">
                BrandBoost AI
              </span>
            </LoadingLink>
            <p className="text-sm text-muted-foreground max-w-sm">
              AI-Powered Brand Research, Automated Logo Presentations, and Instant Brand Guideline Generation.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><LoadingLink href="/about" className="text-muted-foreground hover:text-foreground">About</LoadingLink></li>
              <li><LoadingLink href="/services" className="text-muted-foreground hover:text-foreground">Services</LoadingLink></li>
              <li><LoadingLink href="/portfolio" className="text-muted-foreground hover:text-foreground">Work</LoadingLink></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><LoadingLink href="/team" className="text-muted-foreground hover:text-foreground">Team</LoadingLink></li>
              <li><LoadingLink href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</LoadingLink></li>
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
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
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
