import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";

export default function TeamPage() {
  const teamMembers = [
    { name: "Alex Rivera", role: "Founder & Lead Strategist", src: "https://placehold.co/400x400.png", hint: "professional man" },
    { name: "Casey Jordan", role: "Creative Director", src: "https://placehold.co/400x400.png", hint: "creative woman" },
    { name: "Morgan Lee", role: "Lead UI/UX Designer", src: "https://placehold.co/400x400.png", hint: "designer portrait" },
    { name: "Taylor Smith", role: "Head of Web Development", src: "https://placehold.co/400x400.png", hint: "developer" },
    { name: "Jamie Chen", role: "AI & Automation Specialist", src: "https://placehold.co/400x400.png", hint: "tech professional" },
    { name: "Drew Patel", role: "Senior Brand Consultant", src: "https://placehold.co/400x400.png", hint: "consultant portrait" },
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold">Meet the Minds Behind the Magic</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We are a diverse team of creative designers, brand strategists, and tech innovators passionate about building unforgettable brands.
        </p>
      </section>

      <section className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </section>

      <section className="mt-24 text-center bg-card/50 rounded-lg p-10">
        <h2 className="text-3xl font-bold">Join Our Team</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Ready to make an impact? We're looking for passionate individuals to join our mission.
        </p>
        <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="rounded-full">
                <LoadingLink href="/contact">See Open Positions</LoadingLink>
            </Button>
        </div>
      </section>
    </div>
  );
}
