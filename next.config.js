const createNextIntlPlugin = require('next-intl/plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8800",
        pathname: "/**", 

      },
      {
        protocol: "https",
        hostname: "yjoybxvmnfwkuzrthdge.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

const withIntl = createNextIntlPlugin()
module.exports = withIntl(nextConfig)
