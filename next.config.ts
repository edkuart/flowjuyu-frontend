import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

const withIntl = createNextIntlPlugin();

export default withIntl(nextConfig);
