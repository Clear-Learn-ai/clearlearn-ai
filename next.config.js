/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // experimental: {
  //   serverComponentsExternalPackages: []
  // },
  // webpack: (config) => {
  //   // Handle native modules aliases for client-side
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     encoding: false,
  //   }

  //   // Handle fallbacks for client-side
  //   config.resolve.fallback = {
  //     ...config.resolve.fallback,
  //     fs: false,
  //     path: false,
  //     crypto: false,
  //     buffer: false,
  //     util: false,
  //     stream: false,
  //     os: false,
  //     url: false,
  //     assert: false,
  //   }

  //   return config
  // },
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  env: {
    APP_NAME: 'TradeAI Tutor',
    APP_DESCRIPTION: 'Master plumbing skills with AI-powered visual learning for apprentices',
  }
}

module.exports = nextConfig