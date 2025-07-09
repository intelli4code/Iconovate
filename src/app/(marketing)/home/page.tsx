
"use client";

import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Brush, Palette, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function HomePageContent() {
  const services = [
    { icon: <BrainCircuit className="h-8 w-8 text-primary" />, title: "AI Brand Strategy", description: "Get deep market insights and competitor analysis in minutes." },
    { icon: <Brush className="h-8 w-8 text-primary" />, title: "Logo & Identity Design", description: "Craft memorable logos and comprehensive brand guidelines." },
    { icon: <Palette className="h-8 w-8 text-primary" />, title: "AI Asset Generation", description: "Instantly create mood boards, color palettes, and mockups." },
  ];
  
  const numbers = [
    { value: "95%", label: "Faster Turnaround" },
    { value: "70%", label: "Cost Reduction" },
    { value: "2k+", label: "Brands Launched" },
    { value: "4.9/5", label: "Client Rating" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center">
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    Build an Unforgettable Brand, <span className="text-primary">Intelligently</span>.
                </h1>
                <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                  BrandBoost AI combines expert creativity with powerful AI to deliver high-end branding, websites, and assets at unparalleled speed.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button asChild size="lg" className="rounded-full">
                        <LoadingLink href="/contact">Start Your Project <ArrowRight /></LoadingLink>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full">
                        <LoadingLink href="/services">Our Services</LoadingLink>
                    </Button>
                </div>
            </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">A Smarter Way to Design</h2>
            <p className="mt-4 text-muted-foreground">
              From initial research to final delivery, our AI-powered tools accelerate every step of your creative process, delivering higher quality work, faster.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {services.map((service, index) => (
              <Card key={index} className="text-center bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex justify-center mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Numbers Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">The BrandBoost Difference</h2>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                {numbers.map((stat) => (
                    <div key={stat.label}>
                    <h3 className="text-5xl md:text-6xl font-bold text-primary">{stat.value}</h3>
                    <p className="mt-2 text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

       {/* How it Works Section */}
       <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="max-w-lg">
                    <h2 className="text-3xl font-bold">How We Get Started</h2>
                    <p className="mt-4 text-muted-foreground">
                        We start the journey by posting our videos on YouTube.
                    </p>
                     <p className="mt-4 text-muted-foreground">
                        Praesentium et, praesentium inceptos. In, proin inceptos? Odio cras, vel. Erat, quisque. Maecenas sed, hac? Mus, nascetur? Quam quis, mus? Justo. Maecenas. Proin.
                    </p>
                </div>
                <div className="relative flex justify-center">
                    <Image
                        src="https://placehold.co/600x400.png"
                        data-ai-hint="youtube channel"
                        alt="Youtube channel screenshot"
                        width={600}
                        height={400}
                        className="rounded-lg object-cover"
                    />
                </div>
            </div>
        </div>
       </section>

       {/* CTA Section */}
       <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
            <div className="bg-card/50 rounded-lg p-10 max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold">Ready to Elevate Your Brand?</h2>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                    Let's create something unforgettable together. Get in touch to discuss your project and see how BrandBoost AI can help you achieve your goals.
                </p>
                <Button asChild size="lg" className="mt-8 rounded-full">
                    <LoadingLink href="/contact">Get Started Today</LoadingLink>
                </Button>
            </div>
        </div>
       </section>
    </>
  );
}
