
import { LoadingLink } from "@/components/ui/loading-link";
import { Button } from "@/components/ui/button";
import { Rocket, Twitter, Linkedin, Github } from "lucide-react";
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import type { FooterColumn } from "@/types";

async function getFooterData() {
    try {
        const contentDocRef = doc(db, "siteContent", "main");
        const docSnap = await getDoc(contentDocRef);
        if (docSnap.exists() && docSnap.data().footerColumns) {
            return docSnap.data().footerColumns.sort((a: FooterColumn, b: FooterColumn) => a.order - b.order) as FooterColumn[];
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch footer data:", error);
        return [];
    }
}

export async function MarketingFooter() {
    const footerColumns = await getFooterData();

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
          
          {footerColumns.map(column => (
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
             <a href="#" className="hover:text-foreground"><Twitter className="h-5 w-5" /></a>
             <a href="#" className="hover:text-foreground"><Github className="h-5 w-5" /></a>
             <a href="#" className="hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
