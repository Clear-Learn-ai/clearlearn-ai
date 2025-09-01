'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

const partners = [
  { name: "United Association", type: "Union Partnership" },
  { name: "NCCER", type: "Certification Body" },
  { name: "PHCC", type: "Professional Association" },
  { name: "ABC", type: "Construction Association" },
  { name: "NAPHCC", type: "Training Alliance" },
  { name: "IAPMO", type: "Code Council" }
];

export function TrustSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "top 60%",
            scrub: 1
          }
        }
      );

      logosRef.current.forEach((logo, i) => {
        gsap.fromTo(logo,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.1,
            scrollTrigger: {
              trigger: logo,
              start: "top 85%",
              end: "top 75%",
              scrub: 1
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-b from-black to-zinc-900">
      <div className="container mx-auto px-8">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">Trusted by</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Trade Schools
            </span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            Leading educational institutions and professional organizations 
            trust TradeAI Tutor for next-generation skilled trades training.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) logosRef.current[index] = el;
              }}
              className="group flex flex-col items-center p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mb-4 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all duration-300">
                <span className="text-2xl font-bold text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                  {partner.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-white font-semibold text-center mb-1 group-hover:text-orange-400 transition-colors duration-300">
                {partner.name}
              </h3>
              <p className="text-xs text-zinc-500 text-center">{partner.type}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
            <div className="text-4xl font-bold text-orange-400 mb-4">150+</div>
            <div className="text-white font-semibold mb-2">Trade Schools</div>
            <div className="text-sm text-zinc-400">Using our platform nationwide</div>
          </div>
          
          <div className="text-center p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
            <div className="text-4xl font-bold text-blue-400 mb-4">25K+</div>
            <div className="text-white font-semibold mb-2">Students</div>
            <div className="text-sm text-zinc-400">Trained with AI assistance</div>
          </div>
          
          <div className="text-center p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
            <div className="text-4xl font-bold text-green-400 mb-4">92%</div>
            <div className="text-white font-semibold mb-2">Pass Rate</div>
            <div className="text-sm text-zinc-400">On certification exams</div>
          </div>
        </div>
      </div>
    </section>
  );
}