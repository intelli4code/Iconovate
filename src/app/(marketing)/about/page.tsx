import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import Image from "next/image";

export default function AboutPage() {
    const stats = [
        { value: '300k+', label: 'Lessons Completed' },
        { value: '140+', label: 'Countries Learning' },
        { value: '2k+', label: 'Certificates Issued' },
        { value: '10k+', label: 'Brands Boosted' },
    ];
  return (
    <div className="py-16 md:py-24">
      <section className="container mx-auto px-4 text-center">
        <p className="text-primary font-semibold">ABOUT US</p>
        <h1 className="text-4xl md:text-6xl font-bold mt-2">Hello, we're BrandBoost AI.</h1>
        <h1 className="text-4xl md:text-6xl font-bold">It's nice to meet you 👋</h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
          We merge artistic vision with artificial intelligence to deliver exceptional results with unprecedented speed and precision, making high-end design services accessible to businesses of all sizes.
        </p>
      </section>

      <section className="container mx-auto px-4 mt-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative flex justify-center">
             <Image
              src="https://placehold.co/600x700.png"
              data-ai-hint="professional man"
              alt="A team of designers collaborating"
              width={600}
              height={700}
              className="rounded-lg object-cover w-[80%] md:w-full max-w-md transform rotate-3"
            />
          </div>
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              BrandBoost AI was founded to democratize world-class branding. We noticed a gap in the market: ambitious startups and growing businesses needed high-quality design but were often priced out or left with generic, uninspired solutions.
            </p>
            <p className="mt-4 text-muted-foreground">
              Instead of relying on traditional, time-consuming methods, we integrated cutting-edge AI into our creative process. This allows us to automate research, generate diverse concepts, and produce stunning assets at a fraction of the time and cost. We strive to not only create beautiful designs but to build strategic brand assets that drive growth and create lasting market impact.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <LoadingLink href="/contact">Work With Us</LoadingLink>
            </Button>
          </div>
        </div>
      </section>

       <section className="container mx-auto px-4 mt-24 text-center">
        <h2 className="text-3xl font-bold">Truth in Numbers</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Our track record speaks for itself. We're proud of the impact we've made for our clients worldwide.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {stats.map((stat) => (
            <div key={stat.label}>
              <h3 className="text-5xl md:text-6xl font-bold text-primary">{stat.value}</h3>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
