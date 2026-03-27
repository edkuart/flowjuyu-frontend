const createNextIntlPlugin = require("next-intl/plugin");
const withIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
module.exports = withIntl({
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Supabase Storage — original objects
      {
        protocol: "https",
        hostname: "yjoybxvmnfwkuzrthdge.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabase Image Transform — render/image endpoint (requires Pro tier)
      {
        protocol: "https",
        hostname: "yjoybxvmnfwkuzrthdge.supabase.co",
        pathname: "/storage/v1/render/image/public/**",
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

  // NEXT_PUBLIC_* variables are forwarded automatically from .env.* files.
  // Do NOT re-declare them here — passing undefined explicitly overrides .env.production.
});