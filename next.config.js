/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Permite que o build continue mesmo com erros de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permite que o build continue mesmo com erros de TypeScript
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['ext.same-assets.com', 'telegram.org', 't.me', 'cdn4.telegram-cdn.org', 'cdn5.telegram-cdn.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.telegram-cdn.org',
      },
      {
        protocol: 'https',
        hostname: 'api.telegram.org',
      },
      {
        protocol: 'https',
        hostname: 't.me',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig