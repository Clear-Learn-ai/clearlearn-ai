'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Lenis from 'lenis';
import { HeroSection } from './HeroSection';
import { Interactive3DShowcase } from './Interactive3DShowcase';
import { TestimonialSection } from './TestimonialSection';
import { TrustSection } from './TrustSection';
import { DemoSection } from './DemoSection';
import { MagneticCursor } from './MagneticCursor';
import { SmoothScrollProvider } from './SmoothScrollProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TerminalLandingClient() {
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