
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import type { Service } from "@/types";
import * as LucideIcons from "lucide-react";

async function getServices() {
    try {
        const servicesQuery = query(collection(db, "services"), orderBy("order", "asc"));
        const servicesSnapshot = await getDocs(servicesQuery);
        return servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
    } catch (error) {
        console.error("Failed to fetch services:", error);
        return [];
    }
}


export default async function ServicesPage() {
    const services = await getServices();

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold">Our Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We provide a full spectrum of design services, supercharged by AI, to bring your vision to life.
        </p>
      </section>

      <section className="mt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;
            return (
              <Card key={index} className="bg-card/50">
                <CardHeader>
                  <div className="mb-4"><Icon className="h-8 w-8 text-primary" /></div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
          {services.length === 0 && <p className="col-span-full text-center text-muted-foreground">Services will be displayed here.</p>}
        </div>
      </section>

      <section className="mt-24 rounded-lg p-12 bg-card/50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
             <h2 className="text-3xl font-bold">Our Creative Process</h2>
             <p className="mt-4 text-muted-foreground">We follow a structured, collaborative process to ensure success. From initial discovery and AI-powered research to iterative design and flawless delivery, we keep you in the loop every step of the way.</p>
             <ol className="mt-6 space-y-4">
              <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">1</span><span>Discovery & Strategy</span></li>
              <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">2</span><span>Design & Prototyping</span></li>
              <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">3</span><span>Feedback & Refinement</span></li>
              <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">4</span><span>Final Delivery</span></li>
             </ol>
          </div>
          <div>
            <Image 
              src="https://placehold.co/600x400.png"
              data-ai-hint="design process flowchart"
              alt="Diagram of a creative process"
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
