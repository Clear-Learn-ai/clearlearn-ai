'use client'

// import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Users } from 'lucide-react'

export default function Privacy() {
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
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us. Here's how we protect your data.
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
                icon: Shield,
                title: "Data Protection",
                description: "We use industry-standard encryption to protect your personal information and learning data."
              },
              {
                icon: Eye,
                title: "Transparency",
                description: "We clearly explain what data we collect, how we use it, and who we share it with."
              },
              {
                icon: Lock,
                title: "Secure Storage",
                description: "Your data is stored securely and we never sell your personal information to third parties."
              },
              {
                icon: Users,
                title: "Your Control",
                description: "You have full control over your data and can request deletion or export at any time."
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>• Account information (email, name) when you sign up</li>
                  <li>• Learning queries and interactions with our AI system</li>
                  <li>• Usage analytics to improve our service</li>
                  <li>• Device and browser information for security purposes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Data</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>• Provide personalized learning experiences</li>
                  <li>• Improve our AI algorithms and content recommendations</li>
                  <li>• Send important updates about your account</li>
                  <li>• Analyze usage patterns to enhance our platform</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or rent your personal information. We may share data only in these limited circumstances:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li>• With your explicit consent</li>
                  <li>• To comply with legal obligations</li>
                  <li>• With service providers who help us operate our platform</li>
                  <li>• To protect our rights and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>• Access your personal data</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Delete your account and data</li>
                  <li>• Export your data</li>
                  <li>• Opt out of marketing communications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p>Email: privacy@clearlearn.ai</p>
                  <p>Address: Clearlearn AI Privacy Team</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}