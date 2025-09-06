
import HomePageContent from "./(marketing)/home/page";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc, where, getDoc } from "firebase/firestore";
import type { PortfolioItem, PricingTier, SiteImage, SiteStat, PageContent, FooterContent as FooterContentType, FeaturePoint, Testimonial } from "@/types";
import MarketingLayout from "./(marketing)/layout";
import { FooterContent } from "@/components/marketing/footer";

async function getHomepageData() {
  try {
    const portfolioQuery = query(collection(db, "portfolioItems"), where("isFeatured", "==", true), orderBy("createdAt", "desc"), limit(6));
    const pricingQuery = query(collection(db, "pricingTiers"), orderBy("order", "asc"));
    const contentDocRef = doc(db, "siteContent", "main");
    const testimonialQuery = query(collection(db, "testimonials"), orderBy("order", "asc"), limit(3));
    
    const [portfolioSnapshot, pricingSnapshot, contentDoc, testimonialSnapshot] = await Promise.all([
        getDocs(portfolioQuery),
        getDocs(pricingQuery),
        getDoc(contentDocRef),
        getDocs(testimonialQuery)
    ]);

    const portfolioItems = portfolioSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<PortfolioItem, 'id' | 'createdAt'> & { createdAt: any };
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      } as PortfolioItem;
    })
    const pricingTiers = pricingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PricingTier[];
    const testimonials = testimonialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Testimonial[];
    
    let stats: SiteStat[] = [];
    let images: { [key: string]: SiteImage } = {};
    let pageContent: PageContent | null = null;
    let footerData: FooterContentType | null = null;
    let featurePoints: FeaturePoint[] = [];

    if (contentDoc.exists()) {
        const contentData = contentDoc.data();
        stats = contentData.stats || [];
        images = contentData.images || {};
        pageContent = contentData.pageContent || null;
        featurePoints = contentData.featurePoints || [];
        if(contentData.footer) {
          footerData = contentData.footer as FooterContentType;
          footerData.columns.sort((a,b) => a.order - b.order);
        }
    }
    
    stats.sort((a,b) => a.order - b.order);
    featurePoints.sort((a, b) => a.order - b.order);

    return { portfolioItems, pricingTiers, stats, images, pageContent, footerData, featurePoints, testimonials };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return { portfolioItems: [], pricingTiers: [], stats: [], images: {}, pageContent: null, footerData: null, featurePoints: [], testimonials: [] };
  }
}

export default async function RootPage() {
  const { portfolioItems, pricingTiers, stats, images, pageContent, footerData, featurePoints, testimonials } = await getHomepageData();

  return (
    <MarketingLayout footer={<FooterContent footerData={footerData} />}>
      <HomePageContent 
        portfolioItems={portfolioItems} 
        pricingTiers={pricingTiers} 
        stats={stats} 
        images={images} 
        pageContent={pageContent}
        footerData={footerData}
        featurePoints={featurePoints}
        testimonials={testimonials}
      />
    </MarketingLayout>
  );
}
