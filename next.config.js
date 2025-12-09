/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'amir-kaffeemann.de',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
}

module.exports = nextConfig

