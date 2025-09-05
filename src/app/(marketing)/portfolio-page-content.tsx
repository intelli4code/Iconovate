
"use client";

import { useState } from "react";
import { PortfolioItemCard } from "@/components/marketing/portfolio-item-card";
import type { PortfolioItem } from "@/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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

export default function PortfolioPageContent({ portfolioItems }: { portfolioItems: PortfolioItem[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(portfolioItems.map(item => item.category)))];
  
  const filteredItems = activeCategory === "All"
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

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
        <h1 className="text-4xl md:text-6xl font-bold">Our Work</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We take pride in our work. Here’s a selection of projects that showcase our passion for design and strategic thinking.
        </p>
      </motion.section>
      
      <motion.div
        variants={fadeIn}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        className="flex justify-center flex-wrap gap-2 mt-12"
      >
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </motion.div>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-16"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
               <PortfolioItemCard item={item} />
            </motion.div>
          ))}
        </div>
        {filteredItems.length === 0 && portfolioItems.length > 0 && (
            <p className="text-center text-muted-foreground mt-16">No items found for this category.</p>
        )}
        {portfolioItems.length === 0 && (
          <p className="text-center text-muted-foreground mt-16">No portfolio items have been added yet.</p>
        )}
      </motion.section>
    </motion.div>
  );
}
