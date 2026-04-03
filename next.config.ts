import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
  images: {
    domains: ['fal.media', 'storage.googleapis.com', 'fal.run'],
  },
};

export default nextConfig;
