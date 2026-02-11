const createNextIntlPlugin = require("next-intl/plugin");
const withIntl = createNextIntlPlugin();

module.exports = withIntl({
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Supabase bucket público
      {
        protocol: "https",
        hostname: "yjoybxvmnfwkuzrthdge.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },

      // Rutas locales (si usas uploads/)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8800",
        pathname: "/uploads/**",
      },
    ],

    // Necesario para evitar errores internos cuando la imagen falla
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
});
