"use client";

import React, { useState, useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  
  const [isPointer, setIsPointer] = useState(false);
  const [isText, setIsText] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      requestAnimationFrame(() => {
          if (dotRef.current) {
             dotRef.current.style.left = `${clientX}px`;
             dotRef.current.style.top = `${clientY}px`;
          }
          if (outlineRef.current) {
              outlineRef.current.animate({
                  left: `${clientX}px`,
                  top: `${clientY}px`
              }, { duration: 300, fill: "forwards" });
          }
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
            target.tagName.toLowerCase() === 'a' ||
            target.tagName.toLowerCase() === 'button' ||
            target.closest('a') ||
            target.closest('button') ||
            window.getComputedStyle(target).cursor === 'pointer'
        ) {
            setIsPointer(true);
            setIsText(false);
        } else if (
             target.tagName.toLowerCase() === 'input' ||
             target.tagName.toLowerCase() === 'textarea'
        ) {
            setIsText(true);
            setIsPointer(false);
        } else {
             setIsPointer(false);
             setIsText(false);
        }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const getCursorClasses = () => {
      if (isPointer) return 'pointer';
      if (isText) return 'text';
      return 'default';
  }

  return (
    <div className={`custom-cursor-container ${getCursorClasses()}`}>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={outlineRef} className="custom-cursor-outline" />
    </div>
  );
};

export default CustomCursor;
