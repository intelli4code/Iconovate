
"use client";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import HomePageContent from "./(marketing)/home/page";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc } from "firebase/firestore";
import type { PortfolioItem, PricingTier, SiteImage, SiteStat, PageContent, BackgroundEffects } from "@/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const gradientPositions = [
  { top: '-30rem', right: '-40rem' },
  { top: '30rem', left: '-30rem' },
  { top: '70rem', right: '-35rem' },
  { bottom: '-10rem', left: '-30rem' },
  { bottom: '-20rem', right: '-20rem' },
  { top: '10rem', right: '10rem' },
];


export default function RootPage() {
  const [data, setData] = useState<{
    portfolioItems: PortfolioItem[];
    pricingTiers: PricingTier[];
    stats: SiteStat[];
    images: { [key: string]: SiteImage };
    pageContent: PageContent | null;
    backgroundEffects: BackgroundEffects;
  } | null>(null);

  useEffect(() => {
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

        setData({ portfolioItems, pricingTiers, stats, images, pageContent, backgroundEffects });
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
        setData({ portfolioItems: [], pricingTiers: [], stats: [], images: {}, pageContent: null, backgroundEffects: { animate: true, count: 4 } });
      }
    }
    getHomepageData();
  }, []);

  if (!data) {
    return (
        <div className="relative isolate flex min-h-screen flex-col bg-background font-body text-foreground">
             <div className="absolute inset-0 z-[-1] overflow-hidden" aria-hidden="true"></div>
            <MarketingHeader />
            <main className="flex-1" />
            <MarketingFooter />
        </div>
    )
  }

  const { portfolioItems, pricingTiers, stats, images, pageContent, backgroundEffects } = data;

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background font-body text-foreground">
       <div className="absolute inset-0 z-[-1] overflow-hidden" aria-hidden="true">
        {Array.from({ length: backgroundEffects.count }).map((_, index) => {
          const position = gradientPositions[index % gradientPositions.length];
          const colors = index % 2 === 0
            ? "from-[--primary_2] to-transparent"
            : "from-[--accent_2] to-transparent";
          
          const animation = backgroundEffects.animate
            ? {
                animate: {
                  x: [0, 100, 0, -100, 0],
                  y: [0, -100, 100, 0, 100],
                  rotate: [0, 45, -45, 0],
                  scale: [1, 1.1, 1, 0.9, 1],
                },
                transition: {
                  duration: 40 + index * 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {};
            
          return (
            <motion.div
              key={index}
              className={`absolute h-[70rem] w-[70rem] bg-gradient-radial ${colors} opacity-15 blur-3xl`}
              style={{ ...position }}
              {...animation}
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
