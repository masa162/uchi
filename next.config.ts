import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番環境で外部からのアクセスを許可
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  
};

export default nextConfig;
