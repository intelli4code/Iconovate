import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingLink } from "@/components/ui/loading-link";
import { Linkedin, Twitter } from "lucide-react";
import Image from "next/image";

export default function TeamPage() {
  const teamMembers = [
    { name: "Alex Rivera", role: "Founder & Lead Strategist", src: "https://placehold.co/400x400.png", hint: "professional man" },
    { name: "Casey Jordan", role: "Creative Director", src: "https://placehold.co/400x400.png", hint: "creative woman" },
    { name: "Morgan Lee", role: "Lead UI/UX Designer", src: "https://placehold.co/400x400.png", hint: "designer portrait" },
    { name: "Taylor Smith", role: "Head of Web Development", src: "https://placehold.co/400x400.png", hint: "developer" },
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold">Meet the Team</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          The creative minds and technical wizards behind BrandBoost AI.
        </p>
      </section>

      <section className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member) => (
          <Card key={member.name} className="text-center">
            <CardContent className="pt-6">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarImage src={member.src} data-ai-hint={member.hint} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-headline font-bold">{member.name}</h3>
              <p className="text-primary">{member.role}</p>
              <div className="mt-3 flex justify-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <a href="#"><Twitter className="h-5 w-5" /></a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="#"><Linkedin className="h-5 w-5" /></a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-24 text-center">
        <h2 className="text-3xl font-headline font-bold">Join Our Team</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Are you a designer or an admin? Access your dedicated portal here.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6 p-8 border rounded-lg bg-card">
            <div className="text-left">
                <h3 className="text-xl font-bold font-headline">For Admins & Project Managers</h3>
                <p className="text-muted-foreground mt-1">Access the main dashboard to manage projects, clients, and finances.</p>
            </div>
            <Button asChild>
                <LoadingLink href="/login">Admin Login</LoadingLink>
            </Button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-6 p-8 border rounded-lg bg-card">
            <div className="text-left">
                <h3 className="text-xl font-bold font-headline">For Designers</h3>
                <p className="text-muted-foreground mt-1">Log in to your designer portal to view assigned projects and tasks.</p>
            </div>
            <Button asChild>
                <LoadingLink href="/designer/login">Designer Portal</LoadingLink>
            </Button>
        </div>
      </section>
    </div>
  );
}
