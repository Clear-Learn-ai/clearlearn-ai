'use client'

// import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using Clearlearn.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: August 22, 2025</p>
        </div>

        <div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: FileText,
                title: "Clear Terms",
                description: "Our terms are written in plain language that's easy to understand."
              },
              {
                icon: Scale,
                title: "Fair Usage",
                description: "We believe in fair and reasonable terms that protect both you and us."
              },
              {
                icon: AlertCircle,
                title: "Important Rules",
                description: "Key guidelines to ensure our platform remains safe and educational."
              },
              {
                icon: CheckCircle,
                title: "Your Rights",
                description: "Understanding what you can expect from our service and platform."
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  By accessing and using Clearlearn, you accept and agree to be bound by the terms and provision of this agreement. 
                  These terms apply to the entire website and any email or other type of communication between you and Clearlearn.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Permission is granted to temporarily use Clearlearn for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Modify or copy the materials</li>
                  <li>• Use the materials for any commercial purpose</li>
                  <li>• Attempt to reverse engineer any software</li>
                  <li>• Remove any copyright or other proprietary notations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Content</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  When you submit content to Clearlearn (questions, feedback, etc.), you grant us:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• The right to use your content to improve our service</li>
                  <li>• The right to anonymize and analyze your queries</li>
                  <li>• The right to store your learning history for personalization</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  You retain ownership of your content and can delete it at any time.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Educational Use</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Clearlearn is designed for educational purposes. By using our service, you agree to:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Use the platform for legitimate learning purposes</li>
                  <li>• Not attempt to circumvent our AI safety measures</li>
                  <li>• Not use the service to generate harmful or inappropriate content</li>
                  <li>• Respect intellectual property rights</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Availability</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  We strive to maintain high service availability but cannot guarantee 100% uptime. 
                  We reserve the right to modify or discontinue the service with reasonable notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  Clearlearn's AI-generated content is for educational purposes only. While we strive for accuracy, 
                  we cannot guarantee that all information is correct. Users should verify important information 
                  from authoritative sources.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p>Email: legal@clearlearn.ai</p>
                  <p>Address: Clearlearn AI Legal Team</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}