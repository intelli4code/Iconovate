
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import HomePageContent from "./(marketing)/home/page";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc } from "firebase/firestore";
import type { PortfolioItem, PricingTier, SiteImage, SiteStat, PageContent, BackgroundEffects } from "@/types";

async function getHomepageData() {
    try {
        const portfolioQuery = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"), limit(3));
        const portfolioSnapshot = await getDocs(portfolioQuery);
        const portfolioItems = portfolioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PortfolioItem[];

        const pricingQuery = query(collection(db, "pricingTiers"), orderBy("order", "asc"));
        const pricingSnapshot = await getDocs(pricingQuery);
        const pricingTiers = pricingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PricingTier[];
        
        const contentDocRef = doc(db, "siteContent", "main");
        const contentDoc = await getDoc(contentDocRef);
        let stats: SiteStat[] = [];
        let images: { [key: string]: SiteImage } = {};
        let pageContent: PageContent | null = null;
        let backgroundEffects: BackgroundEffects = { animate: true, count: 4 };

        if (contentDoc.exists()) {
            const contentData = contentDoc.data();
            stats = contentData.stats || [];
            images = contentData.images || {};
            pageContent = contentData.pageContent || null;
            backgroundEffects = contentData.backgroundEffects || backgroundEffects;
        }

        return { portfolioItems, pricingTiers, stats, images, pageContent, backgroundEffects };
    } catch (error) {
        console.error("Failed to fetch homepage data:", error);
        return { portfolioItems: [], pricingTiers: [], stats: [], images: {}, pageContent: null, backgroundEffects: { animate: true, count: 4 } };
    }
}

const gradientPositions = [
  { top: '-30rem', right: '-40rem' },
  { top: '30rem', left: '-30rem' },
  { top: '70rem', right: '-35rem' },
  { bottom: '-10rem', left: '-30rem' },
  { bottom: '-20rem', right: '-20rem' },
  { top: '10rem', right: '10rem' },
];


export default async function RootPage() {
  const { portfolioItems, pricingTiers, stats, images, pageContent, backgroundEffects } = await getHomepageData();

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-[#0d1222] font-body text-foreground">
       <div className="absolute inset-0 z-[-1] overflow-hidden" aria-hidden="true">
        {Array.from({ length: backgroundEffects.count }).map((_, index) => {
          const position = gradientPositions[index % gradientPositions.length];
          const colors = index % 2 === 0
            ? "from-primary/15 to-transparent"
            : "from-accent/10 to-transparent";

          const animationProps = backgroundEffects.animate
            ? {
                // Framer Motion props are passed, but the component itself is inside the client component
              }
            : {};
          
          return (
            <div
              key={index}
              className={`absolute h-[70rem] w-[70rem] bg-gradient-radial ${colors} blur-3xl`}
              style={{ ...position }}
              // Framer Motion animation is handled in client components
            />
          );
        })}
      </div>
      <MarketingHeader />
      <main className="flex-1">
        <HomePageContent portfolioItems={portfolioItems} pricingTiers={pricingTiers} stats={stats} images={images} pageContent={pageContent} />
      </main>
      <MarketingFooter />
    </div>
  );
}
