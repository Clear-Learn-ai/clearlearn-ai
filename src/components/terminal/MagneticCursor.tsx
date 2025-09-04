'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: "power2.out"
      });
      
      gsap.to(follower, {
        x: mouseX,
        y: mouseY,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, {
        scale: 1.5,
        mixBlendMode: 'difference',
        duration: 0.3
      });
      gsap.to(follower, {
        scale: 3,
        opacity: 0.3,
        duration: 0.3
      });
      isHovering = true;
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        mixBlendMode: 'normal',
        duration: 0.3
      });
      gsap.to(follower, {
        scale: 1,
        opacity: 0.6,
        duration: 0.3
      });
      isHovering = false;
    };

    // Add magnetic effect to interactive elements
    const magneticElements = document.querySelectorAll('button, a, [data-magnetic]');
    
    magneticElements.forEach((element) => {
      const handleMagneticEnter = (e: Event) => {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const handleMagneticMove = (e: MouseEvent) => {
          const deltaX = (e.clientX - centerX) * 0.3;
          const deltaY = (e.clientY - centerY) * 0.3;
          
          gsap.to(target, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: "power2.out"
          });
        };
        
        const handleMagneticLeave = () => {
          gsap.to(target, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
          });
          document.removeEventListener('mousemove', handleMagneticMove);
        };
        
        document.addEventListener('mousemove', handleMagneticMove);
        target.addEventListener('mouseleave', handleMagneticLeave, { once: true });
      };
      
      element.addEventListener('mouseenter', handleMagneticEnter);
    });

    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [data-cursor="pointer"]');
    
    interactiveElements.forEach((element) => {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    });

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-4 h-4 bg-orange-500 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-orange-500/60 rounded-full pointer-events-none z-[9998] opacity-60"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}