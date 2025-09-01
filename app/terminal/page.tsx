'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Lenis from 'lenis';
import { HeroSection } from '@/components/terminal/HeroSection';
import { Interactive3DShowcase } from '@/components/terminal/Interactive3DShowcase';
import { TestimonialSection } from '@/components/terminal/TestimonialSection';
import { TrustSection } from '@/components/terminal/TrustSection';
import { DemoSection } from '@/components/terminal/DemoSection';
import { MagneticCursor } from '@/components/terminal/MagneticCursor';
import { SmoothScrollProvider } from '@/components/terminal/SmoothScrollProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TerminalLanding() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <SmoothScrollProvider>
      <div className="bg-black text-white overflow-hidden">
        <MagneticCursor />
        
        <HeroSection />
        
        <Interactive3DShowcase />
        
        <TestimonialSection />
        
        <TrustSection />
        
        <DemoSection />
        
        <footer className="h-20 bg-zinc-950 border-t border-zinc-800" />
      </div>
    </SmoothScrollProvider>
  );
}