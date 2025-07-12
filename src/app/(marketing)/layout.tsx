
"use client";

import { MarketingHeader } from '@/components/marketing/header';
import { MarketingFooter } from '@/components/marketing/footer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { BackgroundEffects } from '@/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const gradientPositions = [
  { top: '-30rem', right: '-40rem' },
  { top: '30rem', left: '-30rem' },
  { top: '70rem', right: '-35rem' },
  { bottom: '-10rem', left: '-30rem' },
  { bottom: '-20rem', right: '-20rem' },
  { top: '10rem', right: '10rem' },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bgEffects, setBgEffects] = useState<BackgroundEffects>({ animate: true, count: 4 });

  useEffect(() => {
      const contentDocRef = doc(db, "siteContent", "main");
      const unsubscribe = onSnapshot(contentDocRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().backgroundEffects) {
              setBgEffects(docSnap.data().backgroundEffects);
          }
      });
      return () => unsubscribe();
  }, []);

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background font-body text-foreground">
      <div className="absolute inset-0 z-[-1] overflow-hidden" aria-hidden="true">
        {Array.from({ length: bgEffects.count }).map((_, index) => {
          const position = gradientPositions[index % gradientPositions.length];
           const colors = index % 2 === 0
            ? "from-[--primary_2] to-transparent"
            : "from-[--accent_2] to-transparent";

          const animation = bgEffects.animate
            ? {
                animate: {
                  x: [0, 100, 0, -100, 0],
                  y: [0, -100, 100, 0, 100],
                  rotate: [0, 45, -45, 0],
                  scale: [1, 1.1, 1, 0.9, 1],
                },
                transition: {
                  duration: 40 + index * 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {};
          
          return (
            <motion.div
              key={index}
              className={`absolute h-[70rem] w-[70rem] bg-gradient-radial ${colors} opacity-15 blur-3xl`}
              style={{ ...position }}
              {...animation}
            />
          );
        })}
      </div>
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
