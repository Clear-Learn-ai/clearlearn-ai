/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  typescript: {
    tsconfigPath: './tsconfig.json'
  },
  eslint: {
    // Temporarily ignore ESLint errors during builds for deployment
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig