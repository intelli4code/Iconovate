
"use client";

import { MarketingHeader } from '@/components/marketing/header';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { BackgroundEffects } from '@/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const gradientPositions = [
  { top: '-20rem', right: '-20rem' },
  { top: '10rem', left: '-30rem' },
  { top: '50rem', right: '0rem' },
  { bottom: '-20rem', left: '-20rem' },
  { bottom: '0rem', right: '-30rem' },
  { top: '20rem', right: '10rem' },
];

export default function MarketingLayout({
  children,
  footer
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const [bgEffects, setBgEffects] = useState<BackgroundEffects>({ animate: true, count: 2 });

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
    <div className="relative isolate flex min-h-screen flex-col font-body text-foreground bg-background">
      <div className="absolute inset-0 z-[-1] overflow-hidden" aria-hidden="true">
        {Array.from({ length: bgEffects.count }).map((_, index) => {
          const position = gradientPositions[index % gradientPositions.length];
          const colors = index % 2 === 0
            ? "from-[--primary_2]"
            : "from-[--accent_2]";

          const animation = bgEffects.animate
            ? {
                animate: {
                  x: [0, 150, -100, 0],
                  y: [0, -100, 150, 0],
                  rotate: [0, 30, -30, 0],
                  scale: [1, 1.2, 0.9, 1],
                },
                transition: {
                  duration: 60 + index * 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {};
          
          return (
            <motion.div
              key={index}
              className={`absolute h-[50rem] w-[50rem] bg-no-repeat [background-image:radial-gradient(circle_at_center,var(--tw-gradient-from)_0,transparent_40%)] ${colors} opacity-20 blur-3xl`}
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
