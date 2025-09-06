
"use client";

import { useState } from "react";
import { PortfolioItemCard } from "@/components/marketing/portfolio-item-card";
import type { PortfolioItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
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

interface PortfolioPageContentProps {
    allItems: PortfolioItem[];
    featuredItems: PortfolioItem[];
}

export default function PortfolioPageContent({ allItems, featuredItems }: PortfolioPageContentProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(allItems.map(item => item.category)))];
  
  const filteredItems = activeCategory === "All"
    ? allItems
    : allItems.filter(item => item.category === activeCategory);

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
      
      {featuredItems.length > 0 && (
          <motion.section 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-20"
          >
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Featured Work</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                {featuredItems.map((item) => (
                    <PortfolioItemCard key={item.id} item={item} />
                ))}
              </div>
          </motion.section>
      )}

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-20"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">All Projects</h2>
        <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="flex justify-center flex-wrap gap-2 mb-12"
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

        <AnimatePresence mode="wait">
            <motion.div
                key={activeCategory}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start"
            >
              {filteredItems.map((item) => (
                   <PortfolioItemCard key={item.id} item={item} />
              ))}
            </motion.div>
        </AnimatePresence>

        {filteredItems.length === 0 && allItems.length > 0 && (
            <p className="text-center text-muted-foreground mt-16">No items found for this category.</p>
        )}
        {allItems.length === 0 && (
          <p className="text-center text-muted-foreground mt-16">No portfolio items have been added yet.</p>
        )}
      </motion.section>
    </motion.div>
  );
}
