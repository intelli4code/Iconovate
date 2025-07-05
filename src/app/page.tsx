import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Clapperboard, BookText, Users, Presentation, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: 'AI-Powered Brand Research',
      description: 'Harness NLP and visual recognition to get market insights, competitor analysis, and data-driven mood boards instantly.',
    },
    {
      icon: <Clapperboard className="h-10 w-10 text-primary" />,
      title: 'Automated Logo Presentations',
      description: 'Upload your logo and watch as it\'s automatically applied to a vast library of mockups, ready for a stunning client presentation.',
    },
    {
      icon: <BookText className="h-10 w-10 text-primary" />,
      title: 'Instant Brand Guidelines',
      description: 'Generate comprehensive brand identity documents from your design assets in seconds. No more tedious manual formatting.',
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: 'Seamless Client Collaboration',
      description: 'A dedicated portal for clients to view progress, give timestamped feedback, and download final assets. Pure professionalism.',
    },
    {
      icon: <Presentation className="h-10 w-10 text-primary" />,
      title: 'Generative Presentation Text',
      description: 'Let our AI craft compelling, personalized narratives for your design presentations, saving you hours of writing.',
    },
    {
      icon: <Rocket className="h-10 w-10 text-primary" />,
      title: 'Streamlined Project Management',
      description: 'Manage your entire project lifecycle from a centralized dashboard. Assign tasks, track progress, and deliver projects on time.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-headline text-primary">BrandBoost AI</h1>
          <Button asChild>
            <Link href="/dashboard">Go to App</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="text-center py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight text-primary">
              Stop Wasting Time. Start Designing.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              BrandBoost AI is the all-in-one platform that automates the tedious parts of brand design, so you can focus on what you do best: creating.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/dashboard">Boost Your Brand Now</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold font-headline text-primary">Your Entire Branding Workflow, Upgraded.</h3>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">From initial research to final delivery, we've got you covered.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="items-center text-center">
                    {feature.icon}
                    <CardTitle className="mt-4 font-headline text-xl">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BrandBoost AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
