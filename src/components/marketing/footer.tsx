import type { FooterContent as FooterContentType, SocialLink } from "@/types";
import { LoadingLink } from "@/components/ui/loading-link";
import { Rocket } from "lucide-react";
import * as LucideIcons from "lucide-react";

export function FooterContent({ footerData }: { footerData: FooterContentType | null }) {
    return (
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
                  {footerData?.description || "AI-Powered Brand Research, Automated Logo Presentations, and Instant Brand Guideline Generation."}
                </p>
              </div>
              
              {footerData?.columns.map(column => (
                <div key={column.id}>
                    <h3 className="font-semibold mb-4">{column.title}</h3>
                    <ul className="space-y-2 text-sm">
                    {column.links.map(link => (
                        <li key={link.id}>
                            <LoadingLink href={link.href} className="text-muted-foreground hover:text-foreground">
                                {link.text}
                            </LoadingLink>
                        </li>
                    ))}
                    </ul>
              </div>
              ))}
    
            </div>
    
            <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} BrandBoost AI. All rights reserved.</p>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                 {footerData?.socials.map(social => {
                    const Icon = (LucideIcons as any)[social.platform] || LucideIcons.Link;
                    return (
                        <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                            <Icon className="h-5 w-5" />
                        </a>
                    )
                 })}
              </div>
            </div>
        </div>
    )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50">
      {/* Content is now passed in via layout */}
    </footer>
  );
}
