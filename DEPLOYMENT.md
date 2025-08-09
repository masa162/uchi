# Docker Deployment Guide

## 現在の状況

### 完了済み
- ✅ Next.js 15対応の型定義修正
- ✅ Docker環境の構築（Dockerfile, docker-compose.yml）
- ✅ ローカルでのDocker PostgreSQL連携確認済み
- ✅ ローカルビルド成功確認済み

### Next.js 15 修正内容
- API Routes: Promise-based params対応
- Page Components: Promise-based params対応
- useSearchParams: Suspense境界追加
- NextAuth: 型定義修正

### Docker 環境
- PostgreSQL 16: 正常動作確認済み
- Next.js アプリ: ローカル開発環境で動作確認済み

## VPS デプロイ手順

### 1. VPS での Docker 環境準備
```bash
# VPS にログイン
ssh masa@150.95.142.69

# プロジェクトディレクトリに移動
cd /var/www/uchi

# 最新コードを取得
git pull origin main

# Docker と Docker Compose のインストール確認
docker --version
docker-compose --version
```

### 2. 環境設定
```bash
# 本番環境変数の設定
cp .env.docker .env

# 必要に応じて環境変数の調整
# - DATABASE_URL の db ホスト名確認
# - NEXTAUTH_URL を本番ドメインに変更
# - OAuth クレデンシャルの確認
```

### 3. Docker デプロイ
```bash
# Docker イメージのビルドとサービス起動
docker-compose up -d

# ログの確認
docker-compose logs -f

# データベース初期化
docker-compose exec app npx prisma db push
```

### 4. 動作確認
- http://[VPS_IP]:3000 でアクセステスト
- OAuth ログイン確認
- データベース接続確認

## トラブルシューティング

### Docker ビルドでネットワークエラーが発生する場合
1. ビルドタイムアウトを延長
2. 段階的ビルド（dependencies → build → runtime）
3. キャッシュクリア後再実行

### 対処法
- `docker system prune -a` でクリーンアップ
- `docker-compose build --no-cache` でキャッシュなしビルド
- VPS の方がネットワーク環境が安定している可能性

## 注意点
- ローカル環境では TailwindCSS の最適化フェーズでネットワークタイムアウト
- VPS 環境では安定してビルドできる可能性が高い
- OAuth の設定は本番ドメイン用に調整が必要