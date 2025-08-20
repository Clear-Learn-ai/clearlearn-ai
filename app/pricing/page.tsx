'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Check, Star } from 'lucide-react'
import { ReactiveNavbar } from '@/components/ReactiveNavbar'

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with AI-powered learning",
      features: [
        "10 questions per day",
        "Basic video recommendations",
        "Standard response time",
        "Community support"
      ],
      buttonText: "Get Started",
      buttonStyle: "border-2 border-gray-300 text-gray-700 hover:border-gray-400"
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "month",
      description: "For serious learners who want unlimited access",
      features: [
        "Unlimited questions",
        "Premium video content",
        "Priority response time",
        "Advanced explanations",
        "Progress tracking",
        "Email support"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "amethyst-gradient text-white hover:opacity-90",
      popular: true
    },
    {
      name: "Team",
      price: "$29.99",
      period: "month",
      description: "Perfect for educators and study groups",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Admin dashboard",
        "Usage analytics",
        "Custom integrations",
        "Priority support"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "border-2 text-gray-700 hover:border-gray-400",
      borderColor: "#B87A7A"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
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
              Simple Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your learning journey. All plans include our core AI-powered features.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-opacity-50' : 'border border-gray-200'
                }`}
                style={plan.popular ? { borderColor: '#B87A7A' } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center px-4 py-2 rounded-full text-white text-sm font-semibold amethyst-gradient">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#1E0F2E' }}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold" style={{ color: '#1E0F2E' }}>
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${plan.buttonStyle}`}
                  style={plan.borderColor ? { borderColor: plan.borderColor } : {}}
                >
                  {plan.buttonText}
                </button>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 text-center"
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#1E0F2E' }}>
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <p className="text-gray-600 mb-4">
                  <strong>Q: Can I change plans anytime?</strong><br />
                  A: Yes, you can upgrade or downgrade your plan at any time from your account settings.
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Q: Is there a free trial for Pro?</strong><br />
                  A: Yes, we offer a 7-day free trial for the Pro plan with no credit card required.
                </p>
                <p className="text-gray-600">
                  <strong>Q: What payment methods do you accept?</strong><br />
                  A: We accept all major credit cards, PayPal, and bank transfers for annual plans.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}