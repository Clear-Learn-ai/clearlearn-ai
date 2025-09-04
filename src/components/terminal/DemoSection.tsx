'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

const demoSteps = [
  {
    title: "Ask Any Question",
    description: "Voice or text input for natural interaction",
    icon: "🎤",
    example: "How do I install a toilet flange?"
  },
  {
    title: "AI Generates Content", 
    description: "3D models, diagrams, and step-by-step guides",
    icon: "🤖",
    example: "Creating 3D toilet installation guide..."
  },
  {
    title: "Interactive Learning",
    description: "Manipulate models, explore systems, practice skills",
    icon: "🔧",
    example: "Try it yourself in 3D space"
  },
  {
    title: "Master the Trade",
    description: "Track progress, earn certifications, advance career",
    icon: "🏆",
    example: "95% mastery achieved!"
  }
];

export function DemoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const stepsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "top 50%",
            scrub: 1
          }
        }
      );

      // Animate steps in sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 2,
          onUpdate: (self) => {
            const step = Math.floor(self.progress * demoSteps.length);
            setCurrentStep(Math.min(step, demoSteps.length - 1));
          }
        }
      });

      stepsRef.current.forEach((step, i) => {
        tl.fromTo(step,
          { x: i % 2 === 0 ? -100 : 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5 },
          i * 0.3
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-screen bg-gradient-to-b from-zinc-900 to-black py-20">
      <div className="container mx-auto px-8">
        <div ref={titleRef} className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Real-time</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              AI Generation
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-4xl mx-auto">
            Watch as our AI instantly creates personalized 3D models, 
            interactive diagrams, and step-by-step guides tailored to your learning style.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Demo Visualization */}
          <div className="relative">
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl p-8 border border-zinc-700">
              <div className="bg-black/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-green-400 font-mono text-sm mb-2">
                  TradeAI Tutor v2.0
                </div>
                <div className="text-white">
                  <div className="mb-4">
                    <span className="text-blue-400">User:</span> "How do I install a toilet flange?"
                  </div>
                  <div className="mb-4">
                    <span className="text-orange-400">AI:</span> 
                    <span className={`transition-opacity duration-500 ${currentStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                      {" "}Generating 3D toilet installation guide...
                    </span>
                  </div>
                  <div className={`transition-opacity duration-500 ${currentStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                    <span className="text-green-400">System:</span> Interactive 3D model ready
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30 transition-opacity duration-500 ${currentStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="text-orange-400 text-2xl mb-2">🚽</div>
                  <div className="text-white text-sm font-semibold">3D Model</div>
                  <div className="text-zinc-400 text-xs">Interactive toilet system</div>
                </div>
                
                <div className={`p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 transition-opacity duration-500 ${currentStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="text-blue-400 text-2xl mb-2">📋</div>
                  <div className="text-white text-sm font-semibold">Step Guide</div>
                  <div className="text-zinc-400 text-xs">8 detailed steps</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">⚡</span>
            </div>
          </div>

          {/* Process Steps */}
          <div className="space-y-8">
            {demoSteps.map((step, index) => (
              <div
                key={index}
                ref={(el) => {
                  if (el) stepsRef.current[index] = el;
                }}
                className={`flex items-start space-x-6 p-6 rounded-2xl border transition-all duration-500 ${
                  currentStep >= index 
                    ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30' 
                    : 'bg-zinc-800/30 border-zinc-700/50'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                  currentStep >= index
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 scale-110'
                    : 'bg-zinc-700'
                }`}>
                  {step.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 transition-colors duration-500 ${
                    currentStep >= index ? 'text-orange-400' : 'text-white'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 mb-3 leading-relaxed">
                    {step.description}
                  </p>
                  <div className={`text-sm font-mono px-3 py-1 rounded-full transition-opacity duration-500 ${
                    currentStep >= index 
                      ? 'bg-orange-500/20 text-orange-300 opacity-100' 
                      : 'bg-zinc-700 text-zinc-500 opacity-50'
                  }`}>
                    {step.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <button className="group px-12 py-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-full text-white font-bold text-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25">
            <span className="mr-3">Experience the Future</span>
            <span className="group-hover:translate-x-2 transition-transform duration-300 inline-block">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}