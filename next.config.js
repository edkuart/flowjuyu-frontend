const createNextIntlPlugin = require("next-intl/plugin");

const withIntl = createNextIntlPlugin();

module.exports = withIntl({
  reactStrictMode: true,

  images: {
    domains: ["localhost", "127.0.0.1", "yjoybxvmnfwkuzrthdge.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yjoybxvmnfwkuzrthdge.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8800",
        pathname: "/**",
      },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
});
