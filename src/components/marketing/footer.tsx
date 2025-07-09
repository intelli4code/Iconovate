
import { LoadingLink } from "@/components/ui/loading-link";
import { Button } from "@/components/ui/button";
import { Rocket, Twitter, Linkedin, Github, Instagram, Facebook } from "lucide-react";
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import type { FooterContent } from "@/types";
import * as LucideIcons from "lucide-react";

async function getFooterData(): Promise<FooterContent | null> {
    try {
        const contentDocRef = doc(db, "siteContent", "main");
        const docSnap = await getDoc(contentDocRef);
        if (docSnap.exists() && docSnap.data().footer) {
            const footerData = docSnap.data().footer as FooterContent;
            footerData.columns.sort((a, b) => a.order - b.order);
            return footerData;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch footer data:", error);
        return null;
    }
}

export async function MarketingFooter() {
    const footerData = await getFooterData();

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
    </footer>
  );
}
