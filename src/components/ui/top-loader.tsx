
"use client";

import { useLoading } from '@/contexts/loading-context';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

export function TopLoader() {
  const { isLoading } = useLoading();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevIsLoadingRef = useRef(false);

  useEffect(() => {
    // This effect ensures we only react to the *start* and *end* of a loading sequence.
    if (isLoading && !prevIsLoadingRef.current) {
      // Start loading
      setVisible(true);
      setProgress(0);
      const startTimer = setTimeout(() => setProgress(90), 10); 
      prevIsLoadingRef.current = true;
      return () => clearTimeout(startTimer);
    } else if (!isLoading && prevIsLoadingRef.current) {
      // Finish loading
      setProgress(100);
      const finishTimer = setTimeout(() => {
        setVisible(false);
        // Fully reset progress after the fade-out transition
        const resetTimer = setTimeout(() => setProgress(0), 300); 
        return () => clearTimeout(resetTimer);
      }, 300); 
      prevIsLoadingRef.current = false;
      return () => clearTimeout(finishTimer);
    }
  }, [isLoading]);

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 h-[3px] z-[200] bg-transparent transition-opacity duration-300",
      visible ? 'opacity-100' : 'opacity-0'
    )}>
      <div
        className="h-full bg-primary"
        style={{
          width: `${progress}%`,
          // Use a long duration for the fake progress, and a short one for the final jump to 100%
          transition: `width ${progress < 100 ? '4s' : '0.2s'} cubic-bezier(0.1, 0.9, 0.2, 1)`,
          // Add a glow effect matching the primary color
          boxShadow: '0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))'
        }}
      />
    </div>
  );
}
