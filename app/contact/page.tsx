'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Phone, MapPin } from 'lucide-react'
import { ReactiveNavbar } from '@/components/ReactiveNavbar'
import { Footer } from '@/components/Footer'

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch with our team",
      contact: "hello@clearlearn.ai",
      action: "mailto:hello@clearlearn.ai"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 24/7",
      action: "/chat"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team directly",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come see us in person",
      contact: "San Francisco, CA",
      action: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <ReactiveNavbar />
      
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <h1 className="text-6xl font-bold mb-6" style={{ color: '#1E0F2E' }}>
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about Clearlearn? We're here to help. Reach out to us using any of the methods below.
            </p>
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          >
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#B87A7A' }}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#1E0F2E' }}>{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <Link
                  href={method.action}
                  className="text-lg font-semibold hover:underline"
                  style={{ color: '#B87A7A' }}
                >
                  {method.contact}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-200">
              <h2 className="text-4xl font-bold text-center mb-8" style={{ color: '#1E0F2E' }}>
                Send us a Message
              </h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                      style={{ focusRingColor: '#1E0F2E' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                      style={{ focusRingColor: '#1E0F2E' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                    style={{ focusRingColor: '#1E0F2E' }}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                    style={{ focusRingColor: '#1E0F2E' }}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none resize-none"
                    style={{ focusRingColor: '#1E0F2E' }}
                  ></textarea>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="px-8 py-4 text-white rounded-xl transition-colors text-lg font-semibold shadow-lg hover:shadow-xl hover:opacity-90"
                    style={{ backgroundColor: '#1E0F2E' }}
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-24"
          >
            <h2 className="text-4xl font-bold text-center mb-16" style={{ color: '#1E0F2E' }}>
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  question: "How does Clearlearn's AI tutoring work?",
                  answer: "Our AI analyzes your questions and learning patterns to provide personalized explanations and curated video content that matches your learning style and level."
                },
                {
                  question: "Is Clearlearn free to use?",
                  answer: "Yes! Clearlearn offers a free tier that includes access to basic AI tutoring features. We also offer premium plans with advanced features for power users."
                },
                {
                  question: "What subjects does Clearlearn support?",
                  answer: "Clearlearn supports a wide range of subjects including STEM fields, humanities, languages, and more. Our AI is constantly learning and expanding its knowledge base."
                },
                {
                  question: "How do I get started?",
                  answer: "Simply visit our chat interface and start asking questions! No signup required to get started, though creating an account unlocks additional features."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#1E0F2E' }}>{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}