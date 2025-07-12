
"use client";

import { MarketingHeader } from '@/components/marketing/header';
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
  footer
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
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
            ? "from-[--primary_2]"
            : "from-[--accent_2]";

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
              className={`absolute h-[70rem] w-[70rem] bg-gradient-to-tr ${colors} to-transparent bg-no-repeat [background-image:radial-gradient(circle_at_center,var(--tw-gradient-stops))] [background-size:25%_25%] opacity-15 blur-3xl`}
              style={{ ...position }}
              {...animation}
            />
          );
        })}
      </div>
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50">
        {footer}
      </footer>
    </div>
  );
}
