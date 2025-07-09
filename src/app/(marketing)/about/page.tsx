import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
    const teamMembers = [
        { name: "Alex Rivera", role: "Founder & Lead Strategist", src: "https://placehold.co/400x400.png", hint: "professional man" },
        { name: "Casey Jordan", role: "Creative Director", src: "https://placehold.co/400x400.png", hint: "creative woman" },
        { name: "Morgan Lee", role: "Lead UI/UX Designer", src: "https://placehold.co/400x400.png", hint: "designer portrait" },
        { name: "Taylor Smith", role: "Head of Web Development", src: "https://placehold.co/400x400.png", hint: "developer" },
        { name: "Jamie Chen", role: "AI & Automation Specialist", src: "https://placehold.co/400x400.png", hint: "tech professional" },
        { name: "Drew Patel", role: "Senior Brand Consultant", src: "https://placehold.co/400x400.png", hint: "consultant portrait" },
    ];
    
    const stats = [
        { value: '300k+', label: 'Lessons Completed' },
        { value: '140+', label: 'Countries Learning' },
        { value: '2k+', label: 'Certificates Issued' },
        { value: '10k+', label: 'Brands Boosted' },
    ];

  return (
    <div className="py-16 md:py-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 text-center">
        <p className="text-primary font-semibold">ABOUT US</p>
        <h1 className="text-4xl md:text-6xl font-bold mt-2">Hello, we're BrandBoost AI.</h1>
        <h1 className="text-4xl md:text-6xl font-bold">It's nice to meet you 👋</h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
          We merge artistic vision with artificial intelligence to deliver exceptional results with unprecedented speed and precision, making high-end design services accessible to businesses of all sizes.
        </p>
      </section>

      {/* Our Story Section */}
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

      {/* Our Team Section */}
      <section className="container mx-auto px-4 mt-24 text-center">
        <h2 className="text-3xl font-bold">Our Team</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Meet the creative minds and technical wizards behind BrandBoost AI. We're a blend of designers, developers, and strategists passionate about building brands.
        </p>
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
            <div key={member.name} className="bg-card/50 p-6 rounded-lg text-center flex flex-col items-center">
                <div className="p-1 bg-gradient-to-tr from-primary to-pink-500 rounded-full">
                    <Avatar className="w-28 h-28 border-4 border-background">
                        <AvatarImage src={member.src} data-ai-hint={member.hint} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                </div>
                <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
                <p className="text-primary">{member.role}</p>
            </div>
            ))}
        </div>
      </section>

      {/* Truth in Numbers Section */}
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
