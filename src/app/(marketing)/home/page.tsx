
"use client";

import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Brush, Palette, ArrowRight, MessageSquare, Users, Volume2, Triangle, Shield, Globe, Zap, Gem } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePageContent() {
  const services = [
    { icon: <BrainCircuit className="h-8 w-8 text-primary" />, title: "AI Brand Strategy", description: "Get deep market insights and competitor analysis in minutes." },
    { icon: <Brush className="h-8 w-8 text-primary" />, title: "Logo & Identity Design", description: "Craft memorable logos and comprehensive brand guidelines." },
    { icon: <Palette className="h-8 w-8 text-primary" />, title: "AI Asset Generation", description: "Instantly create mood boards, color palettes, and mockups." },
  ];

  const portfolioItems = [
    { title: "QuantumLeap Branding", src: "https://placehold.co/600x400.png", hint: "technology branding" },
    { title: "Aether E-Commerce", src: "https://placehold.co/600x400.png", hint: "ecommerce website" },
    { title: "Nova Financial App", src: "https://placehold.co/600x400.png", hint: "fintech app" },
  ];

  const partners = [
    { name: "Dreamure", icon: <Triangle className="h-4 w-4" /> },
    { name: "SWITCH.WIN", icon: <Shield className="h-4 w-4" /> },
    { name: "GlowSphere", icon: <Globe className="h-4 w-4" /> },
    { name: "PinSpace", icon: <Zap className="h-4 w-4" /> },
    { name: "Visionix", icon: <Gem className="h-4 w-4" /> },
  ];

  const floatingItems = [
    { type: 'avatar', src: 'https://placehold.co/80x80.png', hint: 'woman smiling', position: 'top-[20%] left-[25%]', size: 'h-12 w-12 md:h-16 md:w-16' },
    { type: 'avatar', src: 'https://placehold.co/80x80.png', hint: 'man professional', position: 'top-[10%] right-[33%]', size: 'h-10 w-10 md:h-12 md:w-12' },
    { type: 'avatar', src: 'https://placehold.co/80x80.png', hint: 'man smiling', position: 'bottom-[25%] right-[10%]', size: 'h-16 w-16 md:h-20 md:w-20' },
    { type: 'avatar', src: 'https://placehold.co/80x80.png', hint: 'woman professional', position: 'bottom-1/2 left-[20%]', size: 'h-10 w-10 md:h-12 md:w-12' },
    { type: 'avatar', src: 'https://placehold.co/80x80.png', hint: 'woman portrait', position: 'bottom-[10%] left-[33%]', size: 'h-12 w-12 md:h-14 md:w-14' },
    { type: 'icon', icon: <Users className="h-6 w-6" />, position: 'top-[33%] right-[25%]', glow: 'shadow-[0_0_20px_hsl(var(--primary))]' },
    { type: 'icon', icon: <MessageSquare className="h-6 w-6" />, position: 'bottom-[30%] right-[55%]', glow: 'shadow-[0_0_20px_hsl(var(--accent))]' },
    { type: 'icon', icon: <Volume2 className="h-6 w-6" />, position: 'bottom-[40%] left-[5%]', glow: 'shadow-[0_0_20px_hsl(var(--accent))]' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full min-h-screen h-screen overflow-hidden flex flex-col justify-between text-white">
        {/* Empty div to account for header height - assumes header is absolute */}
        <div className="h-24" />

        {/* Background & Orbits */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-purple-950/50 to-black -z-20" />
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-yellow-500/5 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-[150px] -z-10" />

        <div className="absolute inset-0 w-full h-full flex items-center justify-center -z-10">
          <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px]">
            <div className="absolute inset-0 border border-white/5 rounded-full animate-spin [animation-duration:60s]" />
            <div className="absolute inset-[20%] border border-white/5 rounded-full animate-spin [animation-duration:40s] [animation-direction:reverse]" />
            <div className="absolute inset-[40%] border border-white/5 rounded-full animate-spin [animation-duration:25s]" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                  <p className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">20k+</p>
                  <p className="text-sm md:text-base text-white/50 tracking-[0.2em] uppercase">Specialists</p>
              </div>
            </div>

            {floatingItems.map((item, index) => (
               <motion.div
                key={index}
                className={`absolute ${item.position}`}
                initial={{ y: 0, scale: 1 }}
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.1 }}
              >
                {item.type === 'avatar' ? (
                  <Image src={item.src!} data-ai-hint={item.hint!} alt="Specialist" width={80} height={80} className={`${item.size} rounded-full border-2 border-white/20 object-cover shadow-lg`} />
                ) : (
                  <div className={`flex items-center justify-center h-14 w-14 md:h-16 md:w-16 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/10 ${item.glow}`}>
                    {item.icon}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 z-10 flex flex-col items-start text-left max-w-7xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline max-w-3xl leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80">
                Unlock Top Design Talent You Thought Was Out of Reach
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-lg">
              BrandBoost AI connects you with a curated network of elite designers and AI-powered tools to build unforgettable brands, faster than ever.
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10">
                <LoadingLink href="/contact">Start Project <ArrowRight /></LoadingLink>
            </Button>
        </div>
        
        {/* Partners Bar */}
        <div className="w-full z-10 pb-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-x-8 gap-y-4 text-white/40">
              {partners.map(p => (
                <div key={p.name} className="flex items-center gap-2 text-sm font-semibold hover:text-white/80 transition-colors">
                  {p.icon}
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">A Smarter Way to Design</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              From initial research to final delivery, our AI-powered tools accelerate every step of your creative process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {services.map((service, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">{service.icon}</div>
                  <CardTitle className="font-headline">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Portfolio Highlight */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Featured Work</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              A glimpse into the brands we've helped build and elevate.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {portfolioItems.map((item, index) => (
              <Card key={index} className="overflow-hidden group">
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
                    <h3 className="text-xl font-headline font-bold">{item.title}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
             <Button asChild variant="outline">
                <LoadingLink href="/portfolio">View Full Portfolio <ArrowRight className="ml-2"/></LoadingLink>
             </Button>
          </div>
        </div>
      </section>
    </>
  );
}
