import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker用standalone出力設定
  output: 'standalone',
  
  // P006対策: フォント最適化設定
  optimizeFonts: true,
  
  // 本番環境で外部からのアクセスを許可
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    },
    // フォントパッケージ最適化
    optimizePackageImports: ['@next/font']
  },
  
};

export default nextConfig;
