import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker用standalone出力設定
  output: 'standalone',
  
  // 本番環境で外部からのアクセスを許可
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    },
    // P006対策: フォントパッケージ最適化（Next.js 15対応）
    optimizePackageImports: ['@next/font']
  },
  
};

export default nextConfig;
