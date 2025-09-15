
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
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

export default function ShopPageContent() {
  const products = [
    { name: "Brand Identity Template", price: "$49", src: "https://placehold.co/600x400.png", hint: "template document" },
    { name: "Minimalist Icon Set", price: "$29", src: "https://placehold.co/600x400.png", hint: "icon grid" },
    { name: "Web Design UI Kit", price: "$99", src: "https://placehold.co/600x400.png", hint: "ui components" },
    { name: "Social Media Templates", price: "$39", src: "https://placehold.co/600x400.png", hint: "social media posts" },
    { name: "Logo Mockup Pack", price: "$19", src: "https://placehold.co/600x400.png", hint: "logo mockup" },
    { name: "Invoice Template", price: "$15", src: "https://placehold.co/600x400.png", hint: "invoice document" },
  ];

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
        <h1 className="text-4xl md:text-6xl font-bold">Digital Goods</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          High-quality design assets and templates to kickstart your creative projects.
        </p>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-16"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div key={index} variants={staggerItem} whileHover={{ y: -5 }}>
              <Card className="overflow-hidden group bg-card/50">
                <CardHeader className="p-0">
                   <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.src}
                      data-ai-hint={product.hint}
                      alt={`Image for ${product.name}`}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription className="text-primary font-bold text-lg mt-2">{product.price}</CardDescription>
                </CardContent>
                <CardFooter>
                   <Button className="w-full rounded-full">Add to Cart</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
