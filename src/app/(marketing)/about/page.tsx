import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { Rocket, Target, Users } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const values = [
    {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: "Innovation",
      description: "We are obsessed with the future, constantly exploring new technologies to give our clients a competitive edge."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Precision",
      description: "Every pixel, every color, and every word is chosen with purpose to achieve strategic goals."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Partnership",
      description: "We believe in collaboration, working closely with our clients to turn their vision into reality."
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold">About BrandBoost AI</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          We are a team of creative designers, brand strategists, and tech innovators passionate about building unforgettable brands. We merge artistic vision with artificial intelligence to deliver exceptional results with unprecedented speed and precision.
        </p>
      </section>

      <section className="mt-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-headline font-bold">Our Mission</h2>
            <p className="mt-4 text-muted-foreground">
              Our mission is to democratize world-class branding. By integrating AI into our creative process, we make high-end design services accessible to businesses of all sizes, from ambitious startups to established enterprises. We strive to not only create beautiful designs but to build strategic brand assets that drive growth and create lasting market impact.
            </p>
            <Button asChild className="mt-6">
              <LoadingLink href="/contact">Work With Us</LoadingLink>
            </Button>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="https://placehold.co/600x400.png"
              data-ai-hint="team collaboration"
              alt="A team of designers collaborating"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="mt-20 text-center">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Core Values</h2>
        <p className="mt-2 text-muted-foreground">The principles that guide everything we do.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {values.map((value, index) => (
            <div key={index} className="p-8 rounded-lg border bg-card shadow-sm">
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-headline font-bold">{value.title}</h3>
              <p className="mt-2 text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
