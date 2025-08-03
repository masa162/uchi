import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番環境で外部からのアクセスを許可
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  // 開発環境でのホスト設定
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: false
    }
  })
};

export default nextConfig;
