
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

  const portfolioItems = [
    { title: "QuantumLeap Branding", src: "https://placehold.co/600x400.png", hint: "technology branding" },
    { title: "Aether E-Commerce", src: "https://placehold.co/600x400.png", hint: "ecommerce website" },
    { title: "Nova Financial App", src: "https://placehold.co/600x400.png", hint: "fintech app" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/30 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">
            Design Meets Intelligence.
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            BrandBoost AI is the all-in-one platform for modern design agencies. Automate your workflow, manage projects, and deliver stunning results with the power of AI.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <LoadingLink href="/login">Get Started</LoadingLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <LoadingLink href="/services">View Services</LoadingLink>
            </Button>
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
