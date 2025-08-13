#!/bin/bash

# VPS上でDocker containerを再起動するスクリプト
# VPS上で実行してください

cd /root/uchi

echo "🔄 Docker containerを再起動しています..."
docker-compose restart app

sleep 5

echo "📋 アプリケーションログを確認中..."
docker-compose logs --tail=20 app

echo "✅ 再起動完了"
echo "🌐 https://uchinokiroku.com でOAuth認証をテストしてください"