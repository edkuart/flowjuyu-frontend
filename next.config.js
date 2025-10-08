const createNextIntlPlugin = require('next-intl/plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yjoybxvmnfwkuzrthdge.supabase.co", // ✅ tu proyecto Supabase
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com", // ✅ placeholder de compatibilidad
        pathname: "/**",
      },
    ],
  },
}

const withIntl = createNextIntlPlugin()

module.exports = withIntl(nextConfig)
