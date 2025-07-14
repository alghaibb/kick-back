import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
        pathname: "/**"
      },
    ],
  },
  experimental: {
    // Enable better streaming for loading states
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;
