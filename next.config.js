const createNextIntlPlugin = require('next-intl/plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    
  },
  images: {
    domains: ['via.placeholder.com'],
  },
}

const withIntl = createNextIntlPlugin()

module.exports = withIntl(nextConfig)
