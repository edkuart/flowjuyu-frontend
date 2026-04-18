const createNextIntlPlugin = require("next-intl/plugin");
const withIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
module.exports = withIntl({
  reactStrictMode: true,

  images: {
    // In local development, bypass Next's image optimizer so temporary
    // DNS/network issues to Supabase don't turn into repeated `/_next/image` 500s.
    unoptimized: process.env.NODE_ENV === "development",
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
      {
        protocol: "https",
        hostname: "www.flowjuyu.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.flowjuyu.com",
        pathname: "/media/**",
      },

      // 🔥 Backend local (uploads en desarrollo)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8800",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8800",
        pathname: "/media/**",
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
