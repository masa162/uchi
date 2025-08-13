# Claude Code 開発環境情報

## 🔑 SSH接続情報

### ConoHa VPS
- **IPアドレス**: `160.251.136.92`
- **ユーザー**: `root`
- **SSH設定名**: `conoha-vps`
- **SSH鍵**: `/Users/nakayamamasayuki/.ssh/id_ed25519_sinvps_macbook`
- **接続コマンド**: 
  ```bash
  ssh conoha-vps
  ```

### SSH設定ファイル
**場所**: `/Users/nakayamamasayuki/.ssh/config`
```bash
Host conoha-vps
  HostName 160.251.136.92
  User root
  IdentityFile ~/.ssh/id_ed25519_sinvps_macbook
  IdentitiesOnly yes
```

### VPS基本情報
- **サーバー名**: ConoHa-vps-2025-06-24
- **スペック**: メモリ2GB/CPU 3Core/SSD 100GB
- **ドメイン**: uchinokiroku.com
- **アプリケーションパス**: `/var/www/uchi`

---

## 🌐 環境構成

### 本番環境 (VPS)
- **URL**: https://uchinokiroku.com
- **Webサーバー**: Nginx (ポート80/443)
- **アプリサーバー**: Next.js (ポート3000)
- **データベース**: PostgreSQL (ポート5432)
- **SSL**: Let's Encrypt自動更新

### ローカル開発環境
- **プロジェクトパス**: `/Users/nakayamamasayuki/Documents/GitHub/uchi`
- **Node.js**: v18+
- **Next.js**: v15.4.5
- **開発サーバー**: `npm run dev` (ポート3000)

---

## ⚙️ 開発憲法・原則

### 🧹 クリーン環境維持の鉄則
1. **作業開始前**: 環境状態を必ず確認
2. **作業終了後**: 不要なプロセス・ファイルをクリーンアップ
3. **ポート管理**: 使用ポートを明示的に管理・記録
4. **プロセス管理**: 重複起動を避け、停止→起動を基本とする

### 📝 記録・追跡の原則
- 重要な設定変更は必ず記録
- エラー発生時の状況を詳細にログ保存
- 環境復旧手順を常に最新化

### ⚡ 効率化の原則
- タイムアウトしそうな操作は事前チェック
- 繰り返し作業は自動化・スクリプト化
- SSH接続は接続テスト後に本格作業

---

## 🔧 よく使用するコマンド

### VPS接続・操作
```bash
# SSH接続 (簡単！)
ssh conoha-vps

# 接続テスト
ssh conoha-vps "echo 'SSH接続成功'"

# ファイル転送
scp [local_file] conoha-vps:[remote_path]

# アプリディレクトリ移動
cd /var/www/uchi

# プロセス確認
ps aux | grep -E 'next|node' | grep -v grep

# ポート確認
ss -tlnp | grep :3000
```

### 環境クリーンアップ
```bash
# Next.jsプロセス停止
pkill -f next

# 環境変数付きNext.js起動
./start-with-env.sh

# ログ確認
tail -f app.log
tail -f startup.log
```

### Git操作
```bash
# 大きなファイルがある場合の対処
git rm --cached [large_file]
echo "[pattern]" >> .gitignore

# 状態確認
git status
git log --oneline -5
```

---

## 🚨 トラブルシューティング

### SSH接続できない
1. SSH設定確認: `cat ~/.ssh/config | grep -A5 conoha-vps`
2. SSH鍵権限確認: `chmod 600 ~/.ssh/id_ed25519_sinvps_macbook`
3. 接続テスト: `ssh -o ConnectTimeout=10 conoha-vps "echo test"`
4. 詳細デバッグ: `ssh -v conoha-vps`

### ポート競合
1. 使用中プロセス確認: `ss -tlnp | grep :[port]`
2. プロセス停止: `pkill -f [process_name]`
3. 3秒待機後に再起動

### タイムアウト対策
- 長時間操作は`nohup`で背景実行
- 大きなファイル操作前に容量確認
- ネットワーク系操作は事前接続テスト

---

## 📊 環境状態チェックリスト

### 作業開始時
- [ ] SSH接続テスト成功
- [ ] VPS上のNext.jsプロセス状態確認
- [ ] ポート3000の使用状況確認
- [ ] 最新コードの同期状況確認

### 作業終了時
- [ ] 不要なプロセス停止
- [ ] ログファイルの整理
- [ ] 作業内容の記録更新
- [ ] 次回作業のための準備

---

## 🔄 定期メンテナンス

### 週次
- [ ] VPSディスク使用量確認
- [ ] ログファイルのローテーション
- [ ] SSL証明書の有効期限確認

### 月次
- [ ] バックアップ状況確認
- [ ] セキュリティアップデート適用
- [ ] パフォーマンス監視

---

## 📊 監視システム状況

### Phase 3: 監視・通知システム ✅ 完了
- **GitHub Actions**: 5分間隔自動監視
- **VPS cron**: 5分間隔ローカル監視  
- **ヘルスチェックAPI**: 3つのエンドポイント稼働
- **運用ガイド**: `docs/CI_CD/監視システム運用ガイド.md`

### 重要URL
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

# アラート確認
ssh conoha-vps "tail -10 /tmp/uchi-alerts.log"
```

---

## 📋 現在の開発状況

### 完了項目 ✅
- [x] 独自ドメイン設定 (uchinokiroku.com)
- [x] VPS本番環境構築
- [x] Phase 3: 監視・通知システム実装
- [x] ヘルスチェックAPI (3エンドポイント)
- [x] GitHub Actions CI/CD
- [x] SSH接続情報永続化 (この CLAUDE.md更新)

### 進行中 🔄
- [x] 環境クリーンアップ自動化 (scripts/cleanup-environment.sh)
- [ ] SSH接続最適化

### 次期予定 📋
- [ ] 簡易POST機能実装
- [ ] カテゴリ→タグ統合
- [ ] レスポンシブUI改善
- [ ] 検索機能実装

---

## 🎯 重要リンク

### プロジェクト管理 (⭐ 最重要)
- **📋 統合管理マスター**: `docs/PROJECT_MANAGEMENT.md` - **必読**
  - 全TODO/ISSUE/機能の一元管理
  - 優先度別の進捗ダッシュボード  
  - 今週・来週の目標設定
- **📝 移行記録**: `docs/MIGRATION_LOG.md`
- **📊 監視ガイド**: `docs/CI_CD/監視システム運用ガイド.md`

### GitHub
- **リポジトリ**: https://github.com/masa162/uchi
- **Actions**: 監視ワークフロー稼働中

---

## 🤖 Claude Code 使用時の重要事項

### 毎セッション開始時の必須チェック
1. **このCLAUDE.mdを最初に確認**
2. **📋 PROJECT_MANAGEMENT.md確認** - 今日の最高/高優先度項目
3. **SSH接続テスト**: `ssh conoha-vps "echo 'SSH接続成功'"`  
4. **アプリケーション状態確認**: `curl -I https://uchinokiroku.com/`

### 作業終了時の必須事項
1. 変更内容のコミット・プッシュ
2. VPS状態の確認
3. 問題発生時のログ記録
4. 次回作業メモの更新

---

**最終更新**: 2025年8月13日 15:55  
**管理者**: Claude Code Assistant + 中山雅之  
**重要度**: 🔥 必読・常時参照

**🎯 目標**: SSH接続30秒以内、効率的で安定した開発環境の維持**