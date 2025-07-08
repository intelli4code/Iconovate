import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, Brush, Palette, Code, Megaphone, Package } from "lucide-react";
import Image from "next/image";

export default function ServicesPage() {
  const services = [
    {
      icon: <PenTool className="h-8 w-8 text-primary" />,
      title: "Brand Identity & Logo Design",
      description: "We craft memorable logos and comprehensive brand guidelines that tell your unique story and establish a strong market presence.",
    },
    {
      icon: <Brush className="h-8 w-8 text-primary" />,
      title: "Website Design & Development",
      description: "From sleek landing pages to complex e-commerce platforms, we build beautiful, high-performance websites that convert visitors into customers.",
    },
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "UI/UX Design for Apps & Software",
      description: "Our user-centric approach ensures your digital products are not only visually stunning but also intuitive, accessible, and a joy to use.",
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "AI-Powered Design Automation",
      description: "Leverage our cutting-edge AI tools to generate mood boards, color palettes, mockups, and more, accelerating the creative process.",
    },
    {
      icon: <Megaphone className="h-8 w-8 text-primary" />,
      title: "Marketing & Advertising Creatives",
      description: "Capture attention with compelling ad creatives, social media graphics, and marketing materials designed to drive engagement and results.",
    },
    {
      icon: <Package className="h-8 w-8 text-primary" />,
      title: "Packaging Design",
      description: "Make your product stand out on the shelves with eye-catching and practical packaging design that reflects your brand's quality.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold">Our Services</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          We provide a full spectrum of design services, supercharged by AI, to bring your vision to life.
        </p>
      </section>

      <section className="mt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="mb-4">{service.icon}</div>
                <CardTitle className="font-headline">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-24 bg-secondary/30 rounded-lg p-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
             <h2 className="text-3xl font-headline font-bold">Our Creative Process</h2>
             <p className="mt-4 text-muted-foreground">We follow a structured, collaborative process to ensure success. From initial discovery and AI-powered research to iterative design and flawless delivery, we keep you in the loop every step of the way.</p>
             <ol className="mt-6 space-y-4">
              <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">1</span><span>Discovery & Strategy</span></li>
              <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">2</span><span>Design & Prototyping</span></li>
              <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">3</span><span>Feedback & Refinement</span></li>
              <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">4</span><span>Final Delivery</span></li>
             </ol>
          </div>
          <div>
            <Image 
              src="https://placehold.co/600x400.png"
              data-ai-hint="design process flowchart"
              alt="Diagram of a creative process"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
