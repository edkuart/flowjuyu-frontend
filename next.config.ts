import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
  domains: ['via.placeholder.com']
}

};


const withIntl = createNextIntlPlugin();

export default withIntl(nextConfig);
