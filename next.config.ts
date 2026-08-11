import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "edu\\.fzzsai\\.com" }],
          destination: "/edu",
        },
      ],
    };
  },
};

export default nextConfig;
