'use client'

// import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Users, Target, Lightbulb, Heart } from 'lucide-react'
import { ReactiveNavbar } from '@/components/ReactiveNavbar'
import { Footer } from '@/components/Footer'

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-founder",
      bio: "Former MIT researcher with 10+ years in AI and education technology.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-founder", 
      bio: "Ex-Google engineer specializing in machine learning and educational AI systems.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Learning Science",
      bio: "Stanford PhD in Cognitive Science with expertise in personalized learning.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face"
    }
  ]

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We believe everyone deserves access to personalized, effective learning experiences."
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "We constantly push the boundaries of what's possible with AI and education."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Learning is better together. We build tools that connect and empower learners."
    },
    {
      icon: Heart,
      title: "Human-Centered",
      description: "Technology should amplify human potential, not replace human connection."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <ReactiveNavbar />
      
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div
            className="text-center mb-20"
          >
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <h1 className="text-6xl font-bold mb-6" style={{ color: '#1E0F2E' }}>
              About Clearlearn
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make learning more effective, engaging, and accessible for everyone through the power of AI.
            </p>
          </div>

          {/* Story Section */}
          <div
            className="mb-24"
          >
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-200">
              <h2 className="text-4xl font-bold mb-8" style={{ color: '#1E0F2E' }}>Our Story</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="mb-6">
                  Clearlearn was born from a simple observation: despite having access to more information than ever before, 
                  students still struggle to truly understand complex concepts. We realized that the problem wasn't a lack of 
                  content, but rather the lack of personalized, adaptive learning experiences.
                </p>
                <p className="mb-6">
                  Our founders, having experienced the challenges of traditional education firsthand, set out to create 
                  an AI-powered platform that could understand each learner's unique needs and provide tailored explanations 
                  and visual content to accelerate understanding.
                </p>
                <p>
                  Today, Clearlearn serves tradespeople and learners worldwide, helping them master practical skills in
                  plumbing and other skilled trades through our innovative AI tutoring system.
                </p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div
            className="mb-24"
          >
            <h2 className="text-4xl font-bold text-center mb-16" style={{ color: '#1E0F2E' }}>Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="text-center p-6"
                >
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#B87A7A' }}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#1E0F2E' }}>{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div
            className="mb-24"
          >
            <h2 className="text-4xl font-bold text-center mb-16" style={{ color: '#1E0F2E' }}>Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="text-center"
                >
                  <div className="relative mb-6">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1E0F2E' }}>{member.name}</h3>
                  <p className="text-lg mb-4" style={{ color: '#B87A7A' }}>{member.role}</p>
                  <p className="text-gray-600 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div
            className="text-center"
          >
            <div className="rounded-3xl p-16 text-white shadow-2xl" style={{ backgroundColor: '#1E0F2E' }}>
              <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-white/90">
                Ready to experience the future of learning? Start your journey with Clearlearn today.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center px-8 py-4 bg-white rounded-xl hover:bg-gray-100 transition-colors text-xl font-semibold shadow-xl"
                style={{ color: '#1E0F2E' }}
              >
                Start Learning Now
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}