/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['bunnycdn.com', 'your-domain.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

module.exports = nextConfig