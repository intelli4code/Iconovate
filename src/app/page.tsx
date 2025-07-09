
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import HomePageContent from "./(marketing)/home/page";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc } from "firebase/firestore";
import type { PortfolioItem, PricingTier, SiteImage, SiteStat } from "@/types";

async function getHomepageData() {
    try {
        const portfolioQuery = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"), limit(3));
        const portfolioSnapshot = await getDocs(portfolioQuery);
        const portfolioItems = portfolioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PortfolioItem[];

        const pricingQuery = query(collection(db, "pricingTiers"), orderBy("order", "asc"));
        const pricingSnapshot = await getDocs(pricingQuery);
        const pricingTiers = pricingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PricingTier[];
        
        const contentDoc = await getDocs(collection(db, "siteContent"));
        let stats: SiteStat[] = [];
        let images: { [key: string]: SiteImage } = {};

        if (!contentDoc.empty) {
            const contentData = contentDoc.docs[0].data();
            stats = contentData.stats || [];
            images = contentData.images || {};
        }

        return { portfolioItems, pricingTiers, stats, images };
    } catch (error) {
        console.error("Failed to fetch homepage data:", error);
        return { portfolioItems: [], pricingTiers: [], stats: [], images: {} };
    }
}

export default async function RootPage() {
  const { portfolioItems, pricingTiers, stats, images } = await getHomepageData();

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
        <HomePageContent portfolioItems={portfolioItems} pricingTiers={pricingTiers} stats={stats} images={images} />
      </main>
      <MarketingFooter />
    </div>
  );
}
