'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Canvas } from '@react-three/fiber';
import { PipeSystemBackground } from './PipeSystemBackground';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    
    tl.fromTo(titleRef.current, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: "power4.out" }
    )
    .fromTo(subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
      "-=1"
    )
    .fromTo(ctaRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
      "-=0.8"
    );

    gsap.to(containerRef.current, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.5
      }
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          className="w-full h-full"
          dpr={[1, 2]}
        >
          <PipeSystemBackground />
        </Canvas>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 z-10" />
      
      <div className="relative z-20 h-full flex flex-col justify-center items-center px-8 text-center">
        <div ref={titleRef} className="mb-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none">
            <span className="block bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              TRADE
            </span>
            <span className="block text-white mt-2">
              AI TUTOR
            </span>
          </h1>
        </div>
        
        <div ref={subtitleRef} className="mb-12 max-w-4xl">
          <p className="text-xl md:text-2xl lg:text-3xl text-zinc-300 font-light leading-relaxed">
            We have reinvented the future of skilled trades through AI
          </p>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent w-64 mx-auto" />
        </div>
        
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-full text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25">
            <span className="relative z-10">Start Learning</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <button className="group px-8 py-4 border-2 border-white/20 rounded-full text-white font-semibold text-lg transition-all duration-300 hover:border-orange-500 hover:shadow-2xl hover:shadow-white/10">
            <span className="group-hover:text-orange-400 transition-colors duration-300">
              Watch Demo
            </span>
          </button>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-15" />
    </section>
  );
}