
"use client";

import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, ArrowRight, ShieldCheck, Check, Zap, Compass, Wand2, Code, Rocket, HelpCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PortfolioItem, PricingTier, SiteImage, SiteStat, PageContent, FeaturePoint, Testimonial } from "@/types";
import { PortfolioItemCard } from "@/components/marketing/portfolio-item-card";
import { motion } from "framer-motion";
import * as LucideIcons from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface HomePageContentProps {
  portfolioItems: PortfolioItem[];
  pricingTiers: PricingTier[];
  stats: SiteStat[];
  images: { [key: string]: SiteImage };
  pageContent: PageContent | null;
  featurePoints: FeaturePoint[];
  testimonials: Testimonial[];
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

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const dynamicGradientText = (text: string) => {
  return text.replace(/(amazing brands|designs)/g, `<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">$1</span>`);
};

const designProcessSteps = [
    {
        icon: Compass,
        step: "Step 01",
        title: "Discovery Phase",
        description: "Understanding your brand, objectives, and target audience to define project goals.",
    },
    {
        icon: Wand2,
        step: "Step 02",
        title: "Design Concept",
        description: "Creating initial design concepts based on insights gathered during the discovery phase.",
    },
    {
        icon: Code,
        step: "Step 03",
        title: "Development & Testing",
        description: "Building and refining the website, ensuring functionality and compatibility across devices.",
    },
    {
        icon: Rocket,
        step: "Step 04",
        title: "Launch & Support",
        description: "Deploying the finalized website and providing ongoing support to ensure long-term success.",
    },
];

const tools = [
  {
    name: "Adobe Photoshop",
    description: "Industry-standard for raster graphics editing and image manipulation.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#31A8FF"/>
        <path d="M12.42 8.16H10.12V16H12.42C14.84 16 15.82 14.52 15.82 12.08C15.82 9.64 14.82 8.16 12.42 8.16ZM12.38 14.4H11.7V9.76H12.38C13.7 9.76 14.28 10.6 14.28 12.08C14.28 13.56 13.7 14.4 12.38 14.4Z" fill="white"/>
        <path d="M8.2 8.16H6V16H8.2V8.16Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "Canva",
    description: "User-friendly online design platform for quick and beautiful graphics.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
       <rect width="24" height="24" rx="4" fill="#8D44AD"/>
       <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="url(#paint0_radial_1_2)"/>
        <defs>
        <radialGradient id="paint0_radial_1_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12) rotate(90) scale(10)">
        <stop stopColor="#9B59B6"/>
        <stop offset="1" stopColor="#8E44AD"/>
        </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Adobe Illustrator",
    description: "Premier vector graphics editor for creating scalable logos and illustrations.",
     icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#FF9A00"/>
        <path d="M12 8.16L10.2 13.08H13.8L12 8.16ZM14.9 16H9.1L6 8.16H8.6L12 14.28L15.4 8.16H18L14.9 16Z" fill="white"/>
        <path d="M8.2 8.16H6V16H8.2V8.16Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "Premiere Pro",
    description: "Professional video editing for creating compelling visual stories.",
     icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#9999FF"/>
        <path d="M12.42 8.16H10.12V16H12.42C14.84 16 15.82 14.52 15.82 12.08C15.82 9.64 14.82 8.16 12.42 8.16ZM12.38 14.4H11.7V9.76H12.38C13.7 9.76 14.28 10.6 14.28 12.08C14.28 13.56 13.7 14.4 12.38 14.4Z" fill="white"/>
        <path d="M8.2 8.16H6V16H8.2V8.16Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "After Effects",
    description: "Digital visual effects, motion graphics, and compositing application.",
     icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#9999FF"/>
        <path d="M12 8.16L10.2 13.08H13.8L12 8.16ZM14.9 16H9.1L6 8.16H8.6L12 14.28L15.4 8.16H18L14.9 16Z" fill="white"/>
        <path d="M8.2 8.16H6V16H8.2V8.16Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "Figma",
    description: "A collaborative web application for interface design.",
    icon: (
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8 16C6.9 16 6 15.1 6 14V10C6 8.9 6.9 8 8 8H10V10H8V14C8 14.55 8.45 15 9 15H10V16H8ZM12 12H10V8H12V12ZM16 14C16 15.1 15.1 16 14 16H12V14H14V10H12V8H14C15.1 8 16 8.9 16 10V14Z" fill="#F24E1E"/>
      </svg>
    ),
  },
];


const comparisonData = [
  { other: "Experienced team delivering standard solutions.", arise: "Highly skilled specialists delivering customized solutions." },
  { other: "Offers standard, template-based designs.", arise: "Offers innovative, bespoke website designs." },
  { other: "Limited post-launch support and updates.", arise: "Comprehensive post-launch support and updates." },
  { other: "Basic performance with average loading times.", arise: "Optimal performance with fast loading times." },
  { other: "Basic SEO practices implemented.", arise: "Advanced SEO tactics for enhanced online visibility." }
];

const faqData = [
    {
        question: "What services does Arise offer?",
        answer: "We offer a comprehensive range of design services, including brand identity, web and UI/UX design, marketing materials, and AI-powered brand research to give you a competitive edge."
    },
    {
        question: "Do you provide hosting services?",
        answer: "No, we focus on design and development. However, we can recommend reliable hosting providers and assist with the deployment process to ensure a smooth launch."
    },
    {
        question: "How long does a typical project take?",
        answer: "Project timelines vary depending on the scope and complexity. A typical brand identity project can take 2-4 weeks, while a full website design and development can take 6-12 weeks."
    },
    {
        question: "How do you handle revisions during the process?",
        answer: "Each of our packages includes a set number of revision rounds at key stages. We use a structured feedback process to ensure your input is incorporated effectively and efficiently."
    },
    {
        question: "Do you offer ongoing support after the website launch?",
        answer: "Yes, we offer various support and maintenance packages to ensure your website remains up-to-date, secure, and performs optimally. We can discuss these options towards the end of your project."
    },
    {
        question: "Can you help with content creation for my website?",
        answer: "While our primary focus is design, we partner with talented copywriters and photographers. We can connect you with them or work with your existing content to integrate it seamlessly into the design."
    },
     {
        question: "Can I see examples of your previous work?",
        answer: "Absolutely! You can view a selection of our recent projects in our portfolio section. We're proud of the results we've achieved for our clients."
    },
    {
        question: "Is SEO included in your web design packages?",
        answer: "We implement on-page SEO best practices in all our web design projects, including proper heading structure, mobile-friendliness, and fast load times. For advanced SEO strategies, we partner with specialized SEO agencies."
    },
     {
        question: "What is your pricing structure like?",
        answer: "Our pricing is project-based. We offer several packages tailored to different needs, from startups to enterprise-level companies. You can view our standard packages on the pricing page or contact us for a custom quote."
    },
    {
        question: "What makes Arise different from other agencies?",
        answer: "Our key differentiator is the integration of AI into our creative process. This allows us to deliver data-driven insights, faster turnaround times, and more innovative solutions without compromising on the bespoke quality of our design work."
    }
]


export default function HomePageContent({ portfolioItems, pricingTiers, stats, images, pageContent, featurePoints, testimonials }: HomePageContentProps) {
  const sortedTiers = pricingTiers.sort((a, b) => a.order - b.order);

  const heroImage = images?.homeHero?.imageUrl || "https://placehold.co/800x600.png";
  const heroImageHint = images?.homeHero?.imageHint || "app dashboard screenshot";
  const featureImage = images?.homeFeature?.imageUrl || "https://placehold.co/800x600.png";
  const featureImageHint = images?.homeFeature?.imageHint || "app interface design";
  
  const homeContent = pageContent?.home;

  return (
    <>
      {/* Hero Section */}
      <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="py-20 md:py-32"
        >
        <div 
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
            variants={fadeIn}
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
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center justify-center max-w-4xl mx-auto">
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
      </motion.section>

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
                    {featurePoints.map((point) => {
                      const Icon = (LucideIcons as any)[point.icon] || ShieldCheck;
                      return (
                        <motion.div key={point.id} variants={fadeIn} className="flex items-start gap-4">
                            <div className="flex-shrink-0 text-primary bg-primary/10 p-3 rounded-full">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{point.title}</h3>
                                <p className="mt-2 text-muted-foreground">{point.text}</p>
                                <Button asChild variant="link" className="px-0 mt-2">
                                    <LoadingLink href={point.link || "/services"}>Learn more</LoadingLink>
                                </Button>
                            </div>
                        </motion.div>
                      )
                    })}
                    {featurePoints.length === 0 && <p className="text-muted-foreground">Feature points will be displayed here.</p>}
                </motion.div>
            </div>
        </div>
       </motion.section>

      {/* Comparison Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeIn} className="text-center max-w-2xl mx-auto">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-4">
              Comparison
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Choosing BrandBoost AI Over Others</h2>
            <p className="mt-4 text-muted-foreground">
              See why BrandBoost AI stands out with superior service, innovation, and client satisfaction benchmarks.
            </p>
          </motion.div>
          
          <div className="mt-16 grid grid-cols-2 items-center text-center gap-8 max-w-4xl mx-auto">
             <h3 className="text-2xl font-bold">Other Agencies</h3>
             <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                <span className="text-primary font-black text-3xl">A</span>
                <span>rise</span>
                <span className="text-xs text-muted-foreground self-start">UI</span>
            </h3>
          </div>

          <motion.div
            variants={staggerContainer}
            className="mt-8 space-y-4 max-w-5xl mx-auto"
          >
            {comparisonData.map((item, index) => (
              <motion.div key={index} variants={fadeIn} className="grid md:grid-cols-[1fr_auto_1fr] items-stretch gap-2 md:gap-4">
                <div className="bg-card/30 p-4 rounded-lg text-left flex items-center">
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <Star className="h-5 w-5 text-yellow-500/70 fill-yellow-500/30 flex-shrink-0" />
                      <span>{item.other}</span>
                   </div>
                </div>

                <div className="hidden md:flex items-center justify-center">
                    <div className="bg-card/50 text-primary font-bold rounded-full h-10 w-10 flex items-center justify-center border border-primary/20">
                        V/S
                    </div>
                </div>
                
                <div className="bg-card/80 p-4 rounded-lg text-left border-l-2 border-primary relative overflow-hidden">
                   <div className="absolute inset-0 bg-repeat bg-[length:20px_20px] opacity-5" style={{backgroundImage: `linear-gradient(45deg, hsl(var(--border)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--border)) 25%, transparent 25%)`}}></div>
                   <div className="flex items-center gap-3 relative">
                      <Zap className="h-5 w-5 text-primary fill-primary/50 flex-shrink-0" />
                      <span className="font-semibold">{item.arise}</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Design Process Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeIn} className="text-center max-w-2xl mx-auto">
            <p className="font-semibold text-primary">PROCESS</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Our Design Process</h2>
            <p className="mt-4 text-muted-foreground">
              Explore our streamlined approach to creating bespoke websites that align with your goals.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {designProcessSteps.map((step) => (
              <motion.div key={step.title} variants={fadeIn}>
                <Card className="bg-card/50 border-border/50 p-6 rounded-2xl h-full relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-xs font-bold text-primary/50 bg-primary/10 px-2 py-1 rounded-full">{step.step}</div>
                    <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg text-primary">
                        <step.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Tools Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeIn} className="text-center max-w-2xl mx-auto">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-4">
              Tools
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Tools We Utilize for Excellence</h2>
            <p className="mt-4 text-muted-foreground">
              Discover the advanced tools and technologies we leverage to create cutting-edge websites.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {tools.map((tool) => (
              <motion.div key={tool.name} variants={fadeIn}>
                <Card className="bg-card/50 border-border/50 p-6 rounded-2xl h-full relative overflow-hidden group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-md">{tool.icon}</div>
                      <h3 className="text-xl font-bold">{tool.name}</h3>
                    </div>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background group-hover:bg-primary/20 transition-colors">
                      <a href="#"><ArrowRight className="h-4 w-4" /></a>
                    </Button>
                  </div>
                  <p className="mt-4 text-muted-foreground">{tool.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>


      {/* Portfolio Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="py-16 md:py-24"
      >
        <div 
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
        </div>
      </motion.section>
      
       {/* Testimonials Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="container mx-auto px-4 mt-12 mb-24"
      >
        <motion.div variants={staggerItem} className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <div>
            <p className="text-primary font-bold tracking-widest uppercase">MEMBER TESTIMONIALS</p>
            <h2 className="text-4xl md:text-5xl font-bold mt-2">What users say about our platform</h2>
          </div>
          <p className="text-muted-foreground">
            Members who post their reviews are their own opinion and are not created in consultation with anyone at Swag Academy. comment you see is their personal opinion and we don't cooperate with them at all.
          </p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={staggerItem} whileHover={{ y: -5 }}>
              <Card className="bg-card/50 p-6 rounded-2xl border-border/50 h-full">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.src} data-ai-hint={testimonial.hint} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', testimonial.rating > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground text-sm">{testimonial.review}</p>
              </Card>
            </motion.div>
          ))}
          {testimonials.length === 0 && <p className="col-span-full text-center text-muted-foreground">Testimonials will be displayed here.</p>}
        </motion.div>
      </motion.section>

       {/* FAQ Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeIn} className="text-center max-w-2xl mx-auto">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-4">
              FAQ's
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Frequently Asked Questions</h2>
            <p className="mt-4 text-muted-foreground">
              Answers to common questions about our services, processes, and what sets us apart.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="mt-12 max-w-4xl mx-auto">
             <Accordion type="single" collapsible className="w-full">
                <div className="grid md:grid-cols-2 gap-x-8">
                  {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index + 1}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              </Accordion>
          </motion.div>
           <motion.div variants={fadeIn} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary"/>
                <p className="font-semibold">Still Have a Question?</p>
              </div>
              <Button asChild>
                <LoadingLink href="/contact">Ask Question</LoadingLink>
              </Button>
            </motion.div>
        </div>
      </motion.section>

        {/* Pricing CTA Section */}
       <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="py-16 md:py-24 text-center"
       >
        <div 
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
                  key={tier.id}
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
                         <LoadingLink href={`/contact?plan=${tier.name}`}>
                           {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                         </LoadingLink>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
             {sortedTiers.length === 0 && <p className="col-span-full text-center text-muted-foreground mt-8">Pricing plans will be displayed here.</p>}
        </div>
       </motion.section>
    </>
  );
}
