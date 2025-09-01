'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { PlumbingAssembly } from './PlumbingAssembly';

export function Interactive3DShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [assemblyProgress, setAssemblyProgress] = useState(0);

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

      gsap.to({}, {
        duration: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "bottom 20%",
          scrub: 2,
          onUpdate: (self) => {
            setAssemblyProgress(self.progress);
          }
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-screen bg-gradient-to-b from-black to-zinc-900 py-20">
      <div className="container mx-auto px-8">
        <div ref={titleRef} className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Interactive
            </span>
            <br />
            <span className="text-white">3D Learning</span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Explore plumbing systems in three dimensions. Watch pipes connect, 
            tools interact, and systems come to life as you scroll.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white">Build as You Learn</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Our revolutionary 3D system lets you see inside the pipes, 
                understand water flow, and master complex installations through 
                interactive visualization.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Real-time Assembly</h4>
                <p className="text-sm text-zinc-400">Watch components connect step by step</p>
              </div>

              <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Multi-angle Views</h4>
                <p className="text-sm text-zinc-400">Examine from every perspective</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-full text-white font-semibold hover:scale-105 transition-transform duration-300">
                Try Interactive Demo
              </button>
              <button className="px-8 py-4 border-2 border-zinc-600 rounded-full text-zinc-300 font-semibold hover:border-orange-500 hover:text-orange-400 transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>

          <div className="h-96 lg:h-[600px] relative">
            <Canvas
              camera={{ position: [3, 2, 5], fov: 50 }}
              className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 to-black"
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} color="#ff6b35" />
              <pointLight position={[-10, 5, 5]} intensity={0.5} color="#0ea5e9" />
              
              <PlumbingAssembly progress={assemblyProgress} />
              
              <OrbitControls 
                enableZoom={true}
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
                minDistance={3}
                maxDistance={10}
              />
            </Canvas>
            
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-white">
                Assembly Progress: {Math.round(assemblyProgress * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}