import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$1,500",
      description: "Perfect for new businesses and startups.",
      features: [
        "Logo Design (3 Concepts)",
        "Basic Color Palette",
        "Typography Selection",
        "2 Rounds of Revisions",
      ],
      isPopular: false,
    },
    {
      name: "Professional",
      price: "$4,500",
      description: "Our most popular plan for growing businesses.",
      features: [
        "Everything in Starter, plus:",
        "Full Brand Identity Guide",
        "Business Card Design",
        "Social Media Kit",
        "5 Rounds of Revisions",
      ],
      isPopular: true,
    },
    {
      name: "Enterprise",
      price: "Let's Talk",
      description: "Custom solutions for established brands.",
      features: [
        "Everything in Professional, plus:",
        "Complete Website Design (up to 10 pages)",
        "Custom Illustrations & Icons",
        "Dedicated Project Manager",
        "Unlimited Revisions",
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold">Flexible Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose a plan that fits your needs. We offer transparent pricing to help you get started.
        </p>
      </section>

      <section className="mt-16">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => (
            <Card key={tier.name} className={tier.isPopular ? "border-primary bg-card/50" : "bg-card/50"}>
              <CardHeader className="text-center">
                {tier.isPopular && <p className="text-sm font-semibold text-primary mb-2">MOST POPULAR</p>}
                <CardTitle className="text-3xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price.startsWith('$') && <span className="text-muted-foreground"> / one-time</span>}
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full rounded-full" variant={tier.isPopular ? "default" : "outline"}>
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
