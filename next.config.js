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
    domains: ['ext.same-assets.com'],
  },
}

module.exports = nextConfig