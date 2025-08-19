/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  typescript: {
    tsconfigPath: './tsconfig.json'
  }
}

module.exports = nextConfig