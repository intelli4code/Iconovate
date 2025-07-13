
"use client";

import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, ArrowRight, ShieldCheck, Check, Zap } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PortfolioItem, PricingTier, SiteImage, SiteStat, PageContent, FooterContent as FooterContentType } from "@/types";
import { PortfolioItemCard } from "@/components/marketing/portfolio-item-card";
import { motion } from "framer-motion";
import MarketingLayout from "../layout";
import { FooterContent } from "@/components/marketing/footer";

interface HomePageContentProps {
  portfolioItems: PortfolioItem[];
  pricingTiers: PricingTier[];
  stats: SiteStat[];
  images: { [key: string]: SiteImage };
  pageContent: PageContent | null;
  footerData: FooterContentType | null;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const dynamicGradientText = (text: string) => {
  return text.replace(/(amazing brands|designs)/g, `<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">$1</span>`);
};

export default function HomePageContent({ portfolioItems, pricingTiers, stats, images, pageContent, footerData }: HomePageContentProps) {
  const sortedTiers = pricingTiers.sort((a, b) => a.order - b.order);

  const heroImage = images?.homeHero?.imageUrl || "https://placehold.co/800x600.png";
  const heroImageHint = images?.homeHero?.imageHint || "app dashboard screenshot";
  const featureImage = images?.homeFeature?.imageUrl || "https://placehold.co/800x600.png";
  const featureImageHint = images?.homeFeature?.imageHint || "app interface design";
  
  const homeContent = pageContent?.home;

  return (
    <MarketingLayout footer={<FooterContent footerData={footerData} />}>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-white/20 to-white/10 px-4 py-1.5 text-sm font-medium mb-4 backdrop-blur-sm">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    BEST GRAPHIC DESIGN AGENCY
                </span>
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              {homeContent?.heroTitle ? (
                <span dangerouslySetInnerHTML={{ __html: dynamicGradientText(homeContent.heroTitle) }} />
              ) : (
                <>Platform to build <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> amazing brands</span> and designs</>
              )}
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-6 text-lg text-muted-foreground max-w-lg">
              {homeContent?.heroSubtitle || "Learn from mentors who are experienced in their fields and get official certificates to build future careers."}
            </motion.p>
            <motion.div variants={fadeIn} className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-primary/50 transition-shadow">
                <LoadingLink href="/contact">Start Now <ArrowRight /></LoadingLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <LoadingLink href="/contact">Contact Sales</LoadingLink>
              </Button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative hidden lg:block"
          >
            <Image
            src={heroImage}
            data-ai-hint={heroImageHint}
            alt="App dashboard and mobile screenshots"
            width={800}
            height={600}
            className="rounded-lg object-contain"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            {stats.map((stat) => (
              <motion.div key={stat.id} variants={fadeIn}>
                <Card className="bg-white/5 border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h3 className="text-4xl md:text-5xl font-bold">{stat.value}</h3>
                  <p className="mt-2 text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
             {stats.length === 0 && <p className="col-span-full text-muted-foreground">Stats will be displayed here.</p>}
          </div>
        </div>
      </section>

      {/* Feature Section */}
       <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-16 md:py-24"
       >
        <div className="container mx-auto px-4">
            <motion.div variants={fadeIn} className="text-center max-w-2xl mx-auto">
                <p className="font-semibold text-primary">FEATURED</p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">{homeContent?.featureTitle || "Intelligent Design on a New Scale"}</h2>
                <p className="mt-4 text-muted-foreground">
                    {homeContent?.featureSubtitle || "Risus rutrum nisi, mi sed aliquam. Sit enim, id at viverra. Aliquam tortor."}
                </p>
            </motion.div>
            <div className="mt-16 grid lg:grid-cols-2 gap-16 items-center">
                <motion.div variants={fadeIn} className="relative">
                     <Image
                        src={featureImage}
                        data-ai-hint={featureImageHint}
                        alt="App interface showing financial data"
                        width={800}
                        height={600}
                        className="rounded-lg"
                    />
                </motion.div>
                <motion.div variants={staggerContainer} className="space-y-6">
                    <motion.div variants={fadeIn} className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-primary bg-primary/10 p-3 rounded-full">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{homeContent?.featurePoint1Title || "Stay focused on your creative vision"}</h3>
                            <p className="mt-2 text-muted-foreground">{homeContent?.featurePoint1Text || "Our AI handles the tedious parts of brand research and asset generation, letting you focus on high-impact creative work that drives results."}</p>
                             <Button asChild variant="link" className="px-0 mt-2">
                                <LoadingLink href="/services">Learn more</LoadingLink>
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
       </motion.section>

      {/* Portfolio Section */}
      <section className="py-16 md:py-24">
        <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="container mx-auto px-4"
        >
          <motion.div variants={fadeIn} className="text-center max-w-2xl mx-auto">
            <p className="font-semibold text-primary">OUR WORK</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Crafting Brands That Stand Out</h2>
            <p className="mt-4 text-muted-foreground">
              Here’s a glimpse into the brands we’ve helped build. Each project is a testament to our passion for design and strategic thinking.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {portfolioItems.map((item) => (
              <motion.div key={item.id} variants={fadeIn}>
                <PortfolioItemCard item={item} />
              </motion.div>
            ))}
             {portfolioItems.length === 0 && <p className="col-span-full text-center text-muted-foreground">Portfolio items will be displayed here.</p>}
          </motion.div>
          <motion.div variants={fadeIn} className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <LoadingLink href="/portfolio">View All Work</LoadingLink>
            </Button>
          </motion.div>
        </motion.div>
      </section>

        {/* Pricing CTA Section */}
       <section className="py-16 md:py-24 text-center">
        <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="container mx-auto px-4"
        >
            <motion.div variants={fadeIn} className="max-w-2xl mx-auto">
                 <p className="font-semibold text-primary">PRODUCTS</p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">Plans & Pricing</h2>
                <p className="mt-4 text-muted-foreground">
                    The Continuing education is very important to improve your graphic design knowledge.
                </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              className="mt-16 grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start"
            >
              {sortedTiers.map((tier) => (
                <motion.div
                  key={tier.name}
                  variants={fadeIn}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className={cn(
                    "flex flex-col h-full bg-card/50 rounded-2xl border-border/50 text-left",
                    tier.isPopular && "border-primary/50 ring-2 ring-primary/50"
                  )}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                        {tier.isPopular && <Zap className="h-6 w-6 text-yellow-400 fill-yellow-400" />}
                      </div>
                      <div className="flex items-baseline gap-2 pt-4">
                        <span className="text-5xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground">{tier.priceDescription}</span>
                      </div>
                      <CardDescription>{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <ul className="space-y-3">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <div className="p-6 pt-0">
                       <Button asChild className={cn(
                        "w-full rounded-lg",
                        tier.isPopular ? "bg-gradient-to-r from-primary to-accent text-white" : "bg-transparent border border-border/80 hover:bg-border/50"
                      )}>
                         <LoadingLink href={tier.name === 'Enterprise' ? '/contact' : '/login'}>
                           {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                         </LoadingLink>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
             {sortedTiers.length === 0 && <p className="col-span-full text-center text-muted-foreground mt-8">Pricing plans will be displayed here.</p>}
        </motion.div>
       </section>
    </MarketingLayout>
  );
}
