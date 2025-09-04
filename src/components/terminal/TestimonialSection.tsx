'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

const testimonials = [
  {
    quote: "This AI system taught me more in 2 weeks than I learned in 6 months of traditional training.",
    author: "Mike Rodriguez",
    role: "2nd Year Apprentice",
    company: "Rodriguez Plumbing Co.",
    rating: 5
  },
  {
    quote: "The 3D visualizations make complex pipe routing crystal clear. My apprentices are learning faster than ever.",
    author: "Sarah Johnson",
    role: "Master Plumber",
    company: "Metro Plumbing Solutions", 
    rating: 5
  },
  {
    quote: "I can finally understand P-traps and venting systems. The AI breaks everything down perfectly.",
    author: "David Chen",
    role: "1st Year Apprentice",
    company: "Chen Brothers Plumbing",
    rating: 5
  }
];

export function TestimonialSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

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

      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 100, opacity: 0, scale: 0.8 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: i * 0.2,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "top 70%",
              scrub: 1
            }
          }
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
            <span className="text-white">Built by</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Master Plumbers
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Developed in partnership with industry experts who've spent decades 
            perfecting their craft and training the next generation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="group relative p-8 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl border border-zinc-700/50 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <div className="relative">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-orange-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-lg text-zinc-300 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                <div className="border-t border-zinc-700 pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.author}</h4>
                      <p className="text-zinc-400 text-sm">{testimonial.role}</p>
                      <p className="text-orange-400 text-sm font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-8 p-6 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">500+</div>
              <div className="text-sm text-zinc-400">Master Plumbers</div>
            </div>
            <div className="w-px h-12 bg-zinc-600" />
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">50+</div>
              <div className="text-sm text-zinc-400">Years Experience</div>
            </div>
            <div className="w-px h-12 bg-zinc-600" />
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">98%</div>
              <div className="text-sm text-zinc-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}