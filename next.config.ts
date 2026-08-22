import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/chatbot-api/:path*",
        destination: process.env.CHATBOT_API_URL || "http://localhost:8001/:path*",
      },
    ];
  },
};

export default nextConfig;
