const createNextIntlPlugin = require("next-intl/plugin");
const withIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
module.exports = withIntl({
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // 🔥 Supabase Storage público
      {
        protocol: "https",
        hostname: "yjoybxvmnfwkuzrthdge.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },

      // 🔥 Dominio principal Flowjuyu (para banners externos)
      {
        protocol: "https",
        hostname: "flowjuyu.com",
        pathname: "/**",
      },

      // 🔥 Backend local (uploads en desarrollo)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8800",
        pathname: "/uploads/**",
      },
    ],

    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
});