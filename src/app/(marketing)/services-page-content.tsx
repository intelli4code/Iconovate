
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, onSnapshot, doc } from "firebase/firestore";
import type { Service, SiteImage } from "@/types";
import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};


export default function ServicesPageContent() {
    const [services, setServices] = useState<Service[]>([]);
    const [image, setImage] = useState<SiteImage | null>(null);

    useEffect(() => {
        const servicesQuery = query(collection(db, "services"), orderBy("order", "asc"));
        const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
            setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[]);
        }, (error) => {
            console.error("Failed to fetch services:", error);
        });
        
        const contentDocRef = doc(db, "siteContent", "main");
        const unsubscribeContent = onSnapshot(contentDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setImage(docSnap.data().images?.servicesProcess || null);
            }
        });

        return () => {
            unsubscribeServices();
            unsubscribeContent();
        }
    }, []);

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 md:py-24"
    >
      <motion.section
        variants={fadeIn}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold">Our Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We provide a full spectrum of design services, supercharged by AI, to bring your vision to life.
        </p>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-16"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;
            return (
              <motion.div key={index} variants={staggerItem} whileHover={{ y: -5 }}>
                <Card className="bg-card/50 h-full">
                  <CardHeader>
                    <div className="mb-4"><Icon className="h-8 w-8 text-primary" /></div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {service.deliverables && service.deliverables.length > 0 && (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {service.deliverables.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
          {services.length === 0 && <p className="col-span-full text-center text-muted-foreground">Services will be displayed here.</p>}
        </div>
      </motion.section>

      <motion.section
        variants={fadeIn}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-24 rounded-lg p-12 bg-card/50"
      >
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
              src={image?.imageUrl || "https://placehold.co/600x400.png"}
              data-ai-hint={image?.imageHint || "design process flowchart"}
              alt="Diagram of a creative process"
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

  