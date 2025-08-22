'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Mail, MessageCircle } from 'lucide-react'

export function AppleFooter() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/apple-theme/features' },
        { name: 'Pricing', href: '/apple-theme/pricing' },
        { name: 'Demo', href: '/apple-theme/#demo-section' },
        { name: 'Changelog', href: '/apple-theme/changelog' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/apple-theme/about' },
        { name: 'Blog', href: '/apple-theme/blog' },
        { name: 'Careers', href: '/apple-theme/careers' },
        { name: 'Contact', href: '/apple-theme/contact' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/apple-theme/help' },
        { name: 'API Docs', href: '/apple-theme/docs' },
        { name: 'Community', href: '/apple-theme/community' },
        { name: 'Status', href: '/apple-theme/status' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/apple-theme/privacy' },
        { name: 'Terms', href: '/apple-theme/terms' },
        { name: 'Security', href: '/apple-theme/security' },
        { name: 'Cookies', href: '/apple-theme/cookies' }
      ]
    }
  ]

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/clearlearn', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/clearlearn', label: 'GitHub' },
    { icon: MessageCircle, href: '/apple-theme/community', label: 'Community' },
    { icon: Mail, href: 'mailto:hello@clearlearn.ai', label: 'Email' }
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/apple-theme" className="inline-block mb-4">
              <span className="text-3xl font-thin text-gray-900">
                Clearlearn
              </span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-sm font-light leading-relaxed">
              Master Anything with AI-powered visual learning. Get instant explanations 
              and curated video content to understand complex concepts faster.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-medium text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors font-light"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-100">
          <div className="max-w-md">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Stay updated
            </h3>
            <p className="text-gray-600 mb-4 font-light">
              Get the latest updates on new features and learning resources.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <div className="text-gray-600 mb-4 md:mb-0 font-light">
            © {currentYear} Clearlearn AI. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span className="font-light">Designed with ❤️ for learners worldwide</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-light">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}