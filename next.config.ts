import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Product images from seed data
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Google user avatar images (after OAuth sign-in)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
