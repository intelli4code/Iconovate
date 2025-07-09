
"use client";

import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { Card } from "@/components/ui/card";
import { Star, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function HomePageContent() {

  const stats = [
    { value: "110+", label: "Interactive Videos" },
    { value: "20+", label: "Hours of Content" },
    { value: "5+", label: "Years of Experience" },
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
                        <div className="flex-shrink-0 text-2xl">
                          <Image src="https://placehold.co/40x40" data-ai-hint="shield icon" width={40} height={40} alt="shield icon" />
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
        </div>
       </section>
    </>
  );
}
