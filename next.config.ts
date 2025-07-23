import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
        pathname: "/**"
      },
      // Google Images (for profile pictures)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**"
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  devIndicators: false,
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Compress responses
  compress: true,
  // Enable SWC minification
  swcMinify: true,
};

export default nextConfig;
