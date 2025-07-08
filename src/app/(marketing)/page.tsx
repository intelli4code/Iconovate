import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { ArrowRight, Brush, Palette, PenTool } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const services = [
    {
      icon: <PenTool className="h-8 w-8 text-primary" />,
      title: "Brand Identity",
      description: "Craft a unique brand that resonates with your audience, from logo design to a complete style guide."
    },
    {
      icon: <Brush className="h-8 w-8 text-primary" />,
      title: "Web Design",
      description: "Stunning, responsive websites that not only look good but also perform exceptionally."
    },
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "UI/UX Design",
      description: "Intuitive and engaging user interfaces that provide a seamless user experience."
    }
  ];

  const portfolioItems = [
    { src: "https://placehold.co/600x400.png", hint: "abstract design", alt: "Abstract design portfolio piece" },
    { src: "https://placehold.co/600x400.png", hint: "branding mockup", alt: "Branding mockup portfolio piece" },
    { src: "https://placehold.co/600x400.png", hint: "website design", alt: "Website design portfolio piece" },
    { src: "https://placehold.co/600x400.png", hint: "mobile app ui", alt: "Mobile app UI portfolio piece" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground">
            Design Meets Intelligence
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            BrandBoost AI is a modern design agency that leverages the power of AI to deliver stunning, data-driven brand identities and websites faster than ever before.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <LoadingLink href="/services">Our Services</LoadingLink>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <LoadingLink href="/portfolio">View Portfolio</LoadingLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">What We Do</h2>
            <p className="mt-2 text-muted-foreground">We offer a range of services to elevate your brand.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="p-8 rounded-lg border bg-card text-card-foreground shadow-sm text-center">
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-headline font-bold">{service.title}</h3>
                <p className="mt-2 text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Highlight Section */}
      <section id="portfolio" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Work</h2>
            <p className="mt-2 text-muted-foreground">A glimpse into some of our favorite projects.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {portfolioItems.map((item, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg">
                <Image src={item.src} data-ai-hint={item.hint} alt={item.alt} width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild>
              <LoadingLink href="/portfolio">
                Explore Full Portfolio <ArrowRight className="ml-2 h-4 w-4" />
              </LoadingLink>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Ready to Boost Your Brand?</h2>
            <p className="mt-4 max-w-xl mx-auto">
              Let's build something amazing together. Get in touch with us to discuss your project.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <LoadingLink href="/contact">Get a Free Quote</LoadingLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
