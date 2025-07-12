import MarketingLayout from "./(marketing)/layout";
import { FooterContent } from "@/components/marketing/footer";
import HomePageContent from "./(marketing)/home/page";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc } from "firebase/firestore";
import type { PortfolioItem, PricingTier, SiteImage, SiteStat, PageContent, BackgroundEffects, FooterContent as FooterContentType } from "@/types";

async function getHomepageData() {
  try {
    const portfolioQuery = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"), limit(3));
    const pricingQuery = query(collection(db, "pricingTiers"), orderBy("order", "asc"));
    const contentDocRef = doc(db, "siteContent", "main");
    
    const [portfolioSnapshot, pricingSnapshot, contentDoc] = await Promise.all([
        getDocs(portfolioQuery),
        getDocs(pricingQuery),
        getDoc(contentDocRef)
    ]);

    const portfolioItems = portfolioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PortfolioItem[];
    const pricingTiers = pricingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PricingTier[];
    
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

async function getFooterData(): Promise<FooterContentType | null> {
    try {
        const contentDocRef = doc(db, "siteContent", "main");
        const docSnap = await getDoc(contentDocRef);
        if (docSnap.exists() && docSnap.data().footer) {
            const footerData = docSnap.data().footer as FooterContentType;
            footerData.columns.sort((a, b) => a.order - b.order);
            return footerData;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch footer data:", error);
        return null;
    }
}

export default async function RootPage() {
  const { portfolioItems, pricingTiers, stats, images, pageContent } = await getHomepageData();
  const footerData = await getFooterData();

  return (
      <MarketingLayout footer={<FooterContent footerData={footerData} />}>
        <HomePageContent portfolioItems={portfolioItems} pricingTiers={pricingTiers} stats={stats} images={images} pageContent={pageContent} />
      </MarketingLayout>
  );
}
