import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jbcwppunuoirknpiacay.supabase.co",
      },
    ],
  },
};

export default nextConfig;
