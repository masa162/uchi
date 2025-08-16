「うちの記録」動的ブログ開発 プロジェクト憲章
このドキュメントは、本プロジェクトに関するすべての構成情報、手順、既知の問題を記録する唯一の信頼できる情報源（Single Source of Truth）です。

## 1. プロジェクト概要
**目的**: 家族の記録を保存・共有する動的ブログ「うちの記録」の構築と運用  
**ドメイン**: https://uchinokiroku.com  
**リポジトリ**: https://github.com/masa162/uchi  
**プロジェクト管理者**: 中山雅之

## 2. 技術スタック
**フロントエンド**: Next.js v15.4.5  
**バックエンド**: Node.js v22.18.0 (Next.js)  
**データベース**: PostgreSQL  
**インフラ**: ConoHa VPS (メモリ2GB/CPU 3Core/SSD 100GB)  
**Webサーバー**: Nginx  
**SSL**: Let's Encrypt (自動更新)  
**監視**: GitHub Actions + VPS cron (5分間隔)

## 3. 環境情報
**VPS IPアドレス**: 160.251.136.92  
**VPSサーバー名**: ConoHa-vps-2025-06-24  
**SSHユーザー**: root  
**SSH設定名**: conoha-vps  
**アプリケーションパス**: /var/www/uchi

### SSH設定
**Mac環境SSH鍵**: `/Users/nakayamamasayuki/.ssh/id_ed25519_sinvps_macbook`  
**Windows環境SSH鍵**: `D:\github\uchi\docs\関連資料\conohaVPS\[鍵ファイル名]`

### ローカル開発環境パス
**Mac**: `/Users/nakayamamasayuki/Documents/GitHub/uchi`  
**Windows**: `D:\github\uchi`

## 4. ポート設定
### ローカル開発環境
- Next.js: 3000
- PostgreSQL: 5432

### 本番環境 (VPS)
- SSH: 22
- HTTP (Nginx): 80
- HTTPS (Nginx): 443
- Next.js (内部): 3000
- PostgreSQL (内部): 5432 (外部公開しない)

## 5. ビルド＆デプロイ手順（VPS）

### 通常デプロイ
```bash
cd /var/www/uchi
git pull origin main
npm run build  # ← 絶対に忘れてはいけない！
ls -la .next/  # ビルド確認必須
systemctl restart uchi-app
```

### 緊急復旧手順（node_modules破損時）
```bash
# 1. ローカルでビルド
npm run build
tar -czf .next-backup.tar.gz .next

# 2. VPSに転送・復元
scp .next-backup.tar.gz conoha-vps:/var/www/uchi/
ssh conoha-vps "cd /var/www/uchi && rm -rf .next && tar -xzf .next-backup.tar.gz"

# 3. 依存関係クリーンインストール
ssh conoha-vps "cd /var/www/uchi && sudo rm -rf node_modules && npm ci --omit=dev"

# 4. サービス再起動
ssh conoha-vps "systemctl restart uchi-app"
```

### 重要な確認事項
- VPS作業後は必ず `curl -I https://uchinokiroku.com/` で動作確認
- `.next`ディレクトリの最新性確認
- ビルド完了後のプロセス再起動必須
- **TypeScriptエラー時は必ずローカルビルドテスト先行**

## 6. 監視・ヘルスチェック
### ヘルスチェックエンドポイント
- **メインサイト**: https://uchinokiroku.com
- **ヘルスチェック**: https://uchinokiroku.com/api/health
- **DB監視**: https://uchinokiroku.com/api/health/db
- **認証監視**: https://uchinokiroku.com/api/health/auth

### 監視コマンド
```bash
# 手動ヘルスチェック
ssh conoha-vps "/var/www/uchi/scripts/health-check.sh --verbose"

# 監視ログ確認
ssh conoha-vps "tail -20 /var/log/uchi-health.log"
```

## 7. 開発憲法・重要原則

### 🚨 エラー対応の絶対ルール
1. **眼の前のエラー対応時は必ず CLAUDE.md の厳格ワークフロー遵守**
2. **小さなエラーやイシューを最重視** - 将来の重大障害を予防
3. **問題発見時は必ず `docs/PROJECT_MANAGEMENT.md` にISSUE記録**
4. **根本原因分析必須** - 表面的解決は禁止
5. **PROBLEM_LOG.csv への完全記録** - 教訓の体系化

### 品質保証の原則
- 作業終了時は必ず `npm run build`, `npm run lint` 実行
- 警告も段階的に解決対象とする
- VPS作業時は必ずビルド実行を忘れない
- テスト→ビルド→デプロイの順序厳守

### クリーン環境維持
- 作業開始前の環境状態確認必須
- 作業終了後の不要プロセス・ファイルクリーンアップ
- ポート管理の明示的記録
- 重複起動回避、停止→起動を基本とする

## 8. プロジェクト知見集
プロジェクトで発生した問題、その解決策、重要な教訓は、すべて以下のドキュメントに集約されています。

- **[📚 プロジェクト知見集 (resort.md)](./docs/resort.md)**

エラー発生時や、過去の事例を確認したい場合は、まずこのドキュメントを参照してください。

## 9. 重要リンク・ドキュメント

### 必読管理文書
- **📋 統合管理マスター**: `docs/PROJECT_MANAGEMENT.md` (全TODO/ISSUE一元管理)
- **🧠 プロジェクト知見集**: `docs/resort.md` (問題解決の全記録)
- **📊 問題記録**: `docs/PROBLEM_LOG.csv` (過去の問題・教訓集)
- **📝 移行記録**: `docs/MIGRATION_LOG.md`
- **📊 監視ガイド**: `docs/CI_CD/監視システム運用ガイド.md`

### GitHub
- **リポジトリ**: https://github.com/masa162/uchi
- **Actions**: 監視ワークフロー稼働中（5分間隔）

---
**最終更新**: 2025年8月16日 09:30  
**管理者**: Claude Code Assistant + 中山雅之  
**重要度**: 🔥 必読・常時参照  
**目標**: 家族の記録を安全・安定に保存する高品質ブログシステムの運用  
**新原則**: エラー解決時は情報資産化完了まで作業継続必須（P007教訓）