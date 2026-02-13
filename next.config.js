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

      // 🔥 Backend local (si usas uploads locales)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8800",
        pathname: "/uploads/**",
      },
    ],

    // ⚠️ Solo si realmente necesitas SVG
    dangerouslyAllowSVG: true,

    // 🔥 Mejora compatibilidad cuando la imagen externa falla
    contentDispositionType: "inline",

    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
});
