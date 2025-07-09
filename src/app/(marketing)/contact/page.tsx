import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold">Get In Touch</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We'd love to hear about your project. Fill out the form below or reach out to us through our channels. Let's build something amazing together.
        </p>
      </section>

      <div className="mt-16 grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <div className="p-8 rounded-lg bg-card/50 h-full">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., Website Redesign Project" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea id="message" rows={6} placeholder="Tell us about your project, goals, and timeline." />
              </div>
              <Button type="submit" className="w-full rounded-full">Send Message</Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
           <div className="p-8 rounded-lg bg-card/50 h-full">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6 text-lg">
                    <div className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground">hello@brandboostai.com</span>
                    </div>
                    <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground">(555) 123-4567</span>
                    </div>
                    <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <span className="text-muted-foreground">123 Design Lane<br />Creativity City, DC 12345</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
