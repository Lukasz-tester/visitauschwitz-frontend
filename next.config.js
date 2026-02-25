import createNextIntlPlugin from 'next-intl/plugin'
// import redirects from './redirects.js'

const withNextIntl = createNextIntlPlugin()

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || '/'

// Build remotePatterns safely
const imageSources = [
  NEXT_PUBLIC_SERVER_URL,
  'https://**.vercel-storage.com',
  'https://raw.githubusercontent.com',
  'https://images.visitauschwitz.info', // CF R2
]

const remotePatterns = imageSources
  .filter((item) => item.startsWith('http'))
  .map((item) => {
    const url = new URL(item)
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
    }
  })

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // static HTML export
  trailingSlash: true, // generate /index.html in folders
  reactStrictMode: true,
  images: {
    unoptimized: true, // CF Images handles optimization
    remotePatterns,
  },
  // redirects,
}

export default withNextIntl(nextConfig)
