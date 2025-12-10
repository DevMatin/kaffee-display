const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    runtimeCaching: [
      {
        // HTML-Dokumente: hält zuletzt besuchte Seiten verfügbar
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Tage
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Next.js Data Routes (ISR + SWR)
        urlPattern: ({ url }) => url.pathname.startsWith('/_next/data'),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-data',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Next.js optimierte Bilder
        urlPattern: ({ url }) => url.pathname.startsWith('/_next/image'),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-image',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Supabase Storage Bilder
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'supabase-images',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Allgemeine Bilder (z.B. amir-kaffeemann.de)
        urlPattern: ({ request }) => request.destination === 'image',
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Supabase API
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/rest\/v1\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 1,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Interne Next.js API
        urlPattern: /^\/api\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'next-api',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 1,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
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

module.exports = withPWA(nextConfig)

