#!/bin/bash

# 本番環境用 Next.js 起動スクリプト
# 安定性を重視した本番ビルド + 本番サーバー実行

set -e

echo "🚀 本番環境用 Next.js 起動中..."

# 環境変数の読み込み
if [ -f .env.local ]; then
    echo "🔍 .env.local を読み込み中..."
    export $(grep -v '^#' .env.local | xargs)
else
    echo "⚠️  .env.local が見つかりません"
fi

# データベース接続確認
echo "🔗 DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "🔗 NEXTAUTH_URL: $NEXTAUTH_URL"

# Prisma クライアント生成
echo "📊 Prisma クライアント生成中..."
npx prisma generate

# 本番ビルド実行
echo "🔨 本番ビルド実行中..."
npm run build

# 本番サーバー起動
echo "▶️  本番サーバー起動中..."
npm run start