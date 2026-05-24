import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // @ts-expect-error - ignoreDuringBuilds is valid but types might be outdated
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
