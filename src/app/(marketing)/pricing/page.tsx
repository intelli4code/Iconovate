import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Unlimited access for free courses",
      features: [
        "Access free courses and lessons",
        "Semper sit rhoncus eget viverra",
        "Proin quis felis, tellus tempor",
        "Sed sagittis risus fringilla varius",
        "Lorem ac interdum tincidunt in",
      ],
      isPopular: false,
    },
    {
      name: "Pro",
      price: "$499",
      description: "Unlimited access for paid courses",
      features: [
        "Everything FOREX",
        "110+ Videos, PDF's + Quizzes",
        "No Monthly Fees",
        "Early YouTube Videos",
        "Completion Package",
      ],
      isPopular: true,
    },
  ];

  const testimonials = [
    {
      name: "Callum Bailey",
      rating: 5,
      review: "I've been in and out of learning/wanting to learn about forex for about a year or 2 now. But only since buying this course have I been able to fully understand for... See all",
      src: "https://placehold.co/40x40.png",
      hint: "woman portrait"
    },
    {
      name: "Brayan Ponce",
      rating: 5,
      review: "Course has changed my life, helped me for the better. Really satisfied with Chris, truly feel like God wanted to deliver a message through him for my life. Grateful 🙏",
      src: "https://placehold.co/40x40.png",
      hint: "man portrait"
    },
    {
      name: "Francisco Santana",
      rating: 5,
      review: "Amazing! Words can not describe how grateful I am for finding you. I plan to take my time learning this and hopefully someday it really pays off. The course is the best th... See all",
      src: "https://placehold.co/40x40.png",
      hint: "person portrait"
    },
  ];

  return (
    <div className="py-16 md:py-24">
      {/* Pricing Section */}
      <section className="container mx-auto px-4 text-center max-w-4xl">
        <p className="text-primary font-bold tracking-widest uppercase">PRODUCTS</p>
        <h1 className="text-4xl md:text-6xl font-bold mt-2">Plans & Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">The Continuing education is very important to improve your forex knowledge.</p>
      </section>

      <section className="container mx-auto px-4 mt-16">
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
          {tiers.map((tier) => (
            <Card key={tier.name} className={cn(
              "bg-card/50 rounded-2xl border-border/50 p-4",
              tier.isPopular && "border-primary/50"
            )}>
              <CardHeader className="text-left">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  {tier.isPopular && <Zap className="h-6 w-6 text-yellow-400 fill-yellow-400" />}
                </div>
                <div className="flex items-baseline gap-2 pt-4">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">USD</span>
                </div>
                <p className="text-muted-foreground">{tier.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className={cn(
                  "w-full rounded-lg",
                  tier.isPopular ? "bg-gradient-to-r from-primary to-purple-600 text-white" : "bg-transparent border border-border/80 hover:bg-border/50"
                )}>
                  Get Started
                </Button>
                <ul className="space-y-3 text-left">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                {tier.isPopular && <a href="#" className="text-sm text-primary hover:underline">Learn more about feature pro</a>}
              </CardContent>
            </Card>
          ))}
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
            <Card key={testimonial.name} className="bg-card/50 p-6 rounded-2xl border-border/50">
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
        </div>
        <div className="text-center mt-12">
          <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-purple-600 text-white">Register Now</Button>
        </div>
      </section>
    </div>
  );
}
