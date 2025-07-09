
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import HomePageContent from "./(marketing)/home/page";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import type { PortfolioItem } from "@/types";

export default async function RootPage() {
  const portfolioItems = await (async () => {
    try {
      const q = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"), limit(3));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PortfolioItem[];
    } catch (error) {
      console.error("Failed to fetch portfolio items for homepage:", error);
      return [];
    }
  })();

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-[#0d1222] font-body text-foreground">
       <div
        className="absolute inset-0 z-[-1] overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute right-[-40rem] top-[-30rem] h-[80rem] w-[80rem] bg-gradient-radial from-purple-500/15 to-transparent blur-3xl" />
        <div className="absolute left-[-30rem] top-[30rem] h-[70rem] w-[70rem] bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
        <div className="absolute right-[-35rem] top-[70rem] h-[80rem] w-[80rem] bg-gradient-radial from-fuchsia-500/15 to-transparent blur-3xl" />
        <div className="absolute left-[-20rem] bottom-[-20rem] h-[70rem] w-[70rem] bg-gradient-radial from-indigo-500/15 to-transparent blur-3xl" />
      </div>
      <MarketingHeader />
      <main className="flex-1">
        <HomePageContent portfolioItems={portfolioItems} />
      </main>
      <MarketingFooter />
    </div>
  );
}
