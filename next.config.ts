import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker用standalone出力設定
  output: 'standalone',
  
  // 本番環境で外部からのアクセスを許可
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  
};

export default nextConfig;
