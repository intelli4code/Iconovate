import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function PortfolioPage() {
  const portfolioItems = [
    { title: "QuantumLeap Branding", category: "Brand Identity", src: "https://placehold.co/600x400.png", hint: "technology branding" },
    { title: "Aether E-Commerce", category: "Web Design", src: "https://placehold.co/600x400.png", hint: "ecommerce website" },
    { title: "Nova Financial App", category: "UI/UX Design", src: "https://placehold.co/600x400.png", hint: "fintech app" },
    { title: "Helios Energy", category: "Brand Identity", src: "https://placehold.co/600x400.png", hint: "energy logo" },
    { title: "Zenith Health Portal", category: "Web Design", src: "https://placehold.co/600x400.png", hint: "medical dashboard" },
    { title: "Echo Social Platform", category: "UI/UX Design", src: "https://placehold.co/600x400.png", hint: "social media" },
    { title: "Terra Organics Packaging", category: "Packaging", src: "https://placehold.co/600x400.png", hint: "food packaging" },
    { title: "Momentum Fitness", category: "Brand Identity", src: "https://placehold.co/600x400.png", hint: "fitness logo" },
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold">Our Work</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We take pride in our work. Here’s a selection of projects that showcase our passion for design and strategic thinking.
        </p>
      </section>

      <section className="mt-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </section>
    </div>
  );
}
