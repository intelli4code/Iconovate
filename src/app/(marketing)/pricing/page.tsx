
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingLink } from "@/components/ui/loading-link";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import type { PricingTier, Testimonial } from "@/types";

async function getPageData() {
    try {
        const pricingQuery = query(collection(db, "pricingTiers"), orderBy("order", "asc"));
        const pricingSnapshot = await getDocs(pricingQuery);
        const pricingTiers = pricingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PricingTier[];

        const testimonialQuery = query(collection(db, "testimonials"), orderBy("order", "asc"));
        const testimonialSnapshot = await getDocs(testimonialQuery);
        const testimonials = testimonialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Testimonial[];

        return { pricingTiers, testimonials };
    } catch (error) {
        console.error("Failed to fetch pricing page data:", error);
        return { pricingTiers: [], testimonials: [] };
    }
}


export default async function PricingPage() {
  const { pricingTiers, testimonials } = await getPageData();

  return (
    <div className="py-16 md:py-24">
      {/* Pricing Section */}
      <section className="container mx-auto px-4 text-center max-w-4xl">
        <p className="text-primary font-bold tracking-widest uppercase">PRODUCTS</p>
        <h1 className="text-4xl md:text-6xl font-bold mt-2">Plans & Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">The Continuing education is very important to improve your graphic design knowledge.</p>
      </section>

      <section className="container mx-auto px-4 mt-16">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {pricingTiers.map((tier) => (
            <Card key={tier.id} className={cn(
              "flex flex-col h-full bg-card/50 rounded-2xl border-border/50",
              tier.isPopular && "border-primary/50 ring-2 ring-primary/50"
            )}>
              <CardHeader className="text-left">
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
                <ul className="space-y-3 text-left">
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
                  tier.isPopular ? "bg-gradient-to-r from-primary to-purple-600 text-white" : "bg-transparent border border-border/80 hover:bg-border/50"
                )}>
                   <LoadingLink href={tier.name === 'Enterprise' ? '/contact' : '/login'}>
                     {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                   </LoadingLink>
                </Button>
              </div>
            </Card>
          ))}
           {pricingTiers.length === 0 && <p className="col-span-full text-center text-muted-foreground">Pricing plans will be displayed here.</p>}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 mt-24">
        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <div>
            <p className="text-primary font-bold tracking-widest uppercase">MEMBER TESTIMONIALS</p>
            <h2 className="text-4xl md:text-5xl font-bold mt-2">What users say about our platform</h2>
          </div>
          <p className="text-muted-foreground">
            Members who post their reviews are their own opinion and are not created in consultation with anyone at Swag Academy. comment you see is their personal opinion and we don't cooperate with them at all.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-card/50 p-6 rounded-2xl border-border/50">
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
          ))}
          {testimonials.length === 0 && <p className="col-span-full text-center text-muted-foreground">Testimonials will be displayed here.</p>}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-purple-600 text-white">Register Now</Button>
        </div>
      </section>
    </div>
  );
}
