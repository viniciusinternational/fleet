import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    /* config options here */
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    output: 'standalone',
};

export default nextConfig;
