
"use client";

import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, ArrowRight, ShieldCheck, Check, Zap } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function HomePageContent() {

  const stats = [
    { value: "110+", label: "Interactive Videos" },
    { value: "20+", label: "Hours of Content" },
    { value: "5+", label: "Years of Experience" },
  ];

  const portfolioItems = [
    { title: "QuantumLeap Branding", category: "Brand Identity", src: "https://placehold.co/600x400.png", hint: "technology branding" },
    { title: "Aether E-Commerce", category: "Web Design", src: "https://placehold.co/600x400.png", hint: "ecommerce website" },
    { title: "Nova Financial App", category: "UI/UX Design", src: "https://placehold.co/600x400.png", hint: "fintech app" },
  ];

  const tiers = [
    {
      name: "Starter",
      price: "Free",
      priceDescription: "for individuals",
      description: "Get started with our basic AI tools.",
      features: [
        "AI Slogan Generator",
        "AI Color Palette Tool",
        "1 Project Workspace",
        "Limited AI Generations",
      ],
      isPopular: false,
    },
    {
      name: "Pro",
      price: "$49",
      priceDescription: "/ month",
      description: "Unlock the full suite of AI branding tools.",
      features: [
        "Everything in Starter, plus:",
        "Full AI Tool Suite",
        "Unlimited Project Workspaces",
        "Brand Guidelines Generator",
        "Logo Mockups & Variations",
        "Priority Support",
      ],
      isPopular: true,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-white/20 to-white/10 px-4 py-1.5 text-sm font-medium mb-4 backdrop-blur-sm">
                <Star className="h-4 w-4 text-purple-400 fill-purple-400" />
                <span className="font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                    BEST GRAPHIC DESIGN AGENCY
                </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Platform to build 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500"> amazing brands</span> and designs
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Learn from mentors who are experienced in their fields and get official certificates to build future careers.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-primary to-fuchsia-600 text-white shadow-lg hover:shadow-primary/50 transition-shadow">
                <LoadingLink href="/contact">Start Now <ArrowRight /></LoadingLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <LoadingLink href="/contact">Contact Sales</LoadingLink>
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <Image
              src="https://placehold.co/800x600.png"
              data-ai-hint="app dashboard screenshot"
              alt="App dashboard and mobile screenshots"
              width={800}
              height={600}
              className="rounded-lg object-contain"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-white/5 border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                <h3 className="text-4xl md:text-5xl font-bold">{stat.value}</h3>
                <p className="mt-2 text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
       <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
                <p className="font-semibold text-primary">FEATURED</p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">Intelligent Design on a New Scale</h2>
                <p className="mt-4 text-muted-foreground">
                    Risus rutrum nisi, mi sed aliquam. Sit enim, id at viverra. Aliquam tortor.
                </p>
            </div>
            <div className="mt-16 grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                     <Image
                        src="https://placehold.co/800x600.png"
                        data-ai-hint="app interface design"
                        alt="App interface showing financial data"
                        width={800}
                        height={600}
                        className="rounded-lg"
                    />
                </div>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-primary bg-primary/10 p-3 rounded-full">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Stay focused on your creative vision</h3>
                            <p className="mt-2 text-muted-foreground">Our AI handles the tedious parts of brand research and asset generation, letting you focus on high-impact creative work that drives results.</p>
                             <Button asChild variant="link" className="px-0 mt-2">
                                <LoadingLink href="/services">Learn more</LoadingLink>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
       </section>

      {/* Portfolio Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-semibold text-primary">OUR WORK</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Crafting Brands That Stand Out</h2>
            <p className="mt-4 text-muted-foreground">
              Here’s a glimpse into the brands we’ve helped build. Each project is a testament to our passion for design and strategic thinking.
            </p>
          </div>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item, index) => (
              <Card key={index} className="overflow-hidden group bg-card/50 border-border/50">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.src}
                      data-ai-hint={item.hint}
                      alt={`Portfolio piece for ${item.title}`}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-primary font-semibold">{item.category}</p>
                    <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <LoadingLink href="/portfolio">View All Work</LoadingLink>
            </Button>
          </div>
        </div>
      </section>

        {/* Pricing CTA Section */}
       <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
                 <p className="font-semibold text-primary">PRODUCTS</p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">Plans & Pricing</h2>
                <p className="mt-4 text-muted-foreground">
                    The Continuing education is very important to improve your graphic design knowledge.
                </p>
            </div>
            <div className="mt-16 grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
              {tiers.map((tier) => (
                <Card key={tier.name} className={cn(
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
                    <Button className={cn(
                      "w-full rounded-lg",
                      tier.isPopular ? "bg-gradient-to-r from-primary to-purple-600 text-white" : "bg-transparent border border-border/80 hover:bg-border/50"
                    )}>
                      Get Started
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
        </div>
       </section>
    </>
  );
}
