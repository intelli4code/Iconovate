
"use client";

import { PortfolioItemCard } from "@/components/marketing/portfolio-item-card";
import { db } from "@/lib/firebase";
import type { PortfolioItem } from "@/types";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
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

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    async function fetchItems() {
      try {
        const q = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setPortfolioItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PortfolioItem[]);
      } catch (error) {
        console.error("Failed to fetch portfolio items:", error);
      }
    }
    fetchItems();
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
        animate="animate"
        className="text-center max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold">Our Work</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We take pride in our work. Here’s a selection of projects that showcase our passion for design and strategic thinking.
        </p>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mt-16"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
               <PortfolioItemCard item={item} />
            </motion.div>
          ))}
        </div>
        {portfolioItems.length === 0 && (
          <p className="text-center text-muted-foreground mt-16">No portfolio items have been added yet.</p>
        )}
      </motion.section>
    </motion.div>
  );
}
