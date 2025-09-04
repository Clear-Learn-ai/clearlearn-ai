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
  // Optimize serverless functions for Vercel
  outputFileTracing: true,
  experimental: {
    serverComponentsExternalPackages: [
      // 3D and Three.js packages
      'three', 
      '@react-three/drei', 
      '@react-three/fiber',
      'three-mesh-bvh',
      
      // PDF processing
      'pdf-parse',
      'pdf2pic',
      'sharp',
      
      // Video processing
      '@ffmpeg/ffmpeg',
      '@ffmpeg/core',
      'ffmpeg-static',
      'youtube-dl-exec',
      'youtube-transcript-api',
      
      // Canvas and graphics
      'canvas',
      'konva',
      'react-konva',
      
      // Animation
      'gsap',
      'lenis',
      
      // Other heavy packages
      'marked',
    ]
  },
  webpack: (config, { isServer }) => {
    // Externalize heavy dependencies for serverless functions
    if (isServer) {
      config.externals.push({
        // Three.js and 3D libraries
        'three': 'commonjs three',
        '@react-three/drei': 'commonjs @react-three/drei',
        '@react-three/fiber': 'commonjs @react-three/fiber',
        'three/examples/jsm/loaders/GLTFLoader': 'commonjs three/examples/jsm/loaders/GLTFLoader',
        'three/examples/jsm/loaders/DRACOLoader': 'commonjs three/examples/jsm/loaders/DRACOLoader',
        'three-mesh-bvh': 'commonjs three-mesh-bvh',
        
        // PDF processing libraries
        'pdf-parse': 'commonjs pdf-parse',
        'pdf2pic': 'commonjs pdf2pic',
        'sharp': 'commonjs sharp',
        
        // Video processing libraries
        '@ffmpeg/ffmpeg': 'commonjs @ffmpeg/ffmpeg',
        '@ffmpeg/core': 'commonjs @ffmpeg/core',
        'ffmpeg-static': 'commonjs ffmpeg-static',
        'youtube-dl-exec': 'commonjs youtube-dl-exec',
        'youtube-transcript-api': 'commonjs youtube-transcript-api',
        
        // Canvas and image processing
        'canvas': 'commonjs canvas',
        'konva': 'commonjs konva',
        'react-konva': 'commonjs react-konva',
        
        // Animation libraries
        'gsap': 'commonjs gsap',
        'lenis': 'commonjs lenis',
        
        // Other heavy dependencies
        'marked': 'commonjs marked',
      })
    }

    // Handle native modules aliases
    config.resolve.alias.encoding = false

    // Handle fallbacks for client-side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      buffer: false,
      util: false,
      stream: false,
      os: false,
      url: false,
      assert: false,
    }

    return config
  },
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  env: {
    APP_NAME: 'TradeAI Tutor',
    APP_DESCRIPTION: 'Master plumbing skills with AI-powered visual learning for apprentices',
  }
}

module.exports = nextConfig