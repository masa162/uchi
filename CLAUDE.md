# Claude Code 開発環境情報

## 🔑 SSH接続情報

### ConoHa VPS
- **IPアドレス**: `160.251.136.92`
- **ユーザー**: `root`
- **SSH設定名**: `conoha-vps`

### 🖥️ 環境別SSH設定

#### Mac環境
- **SSH鍵**: `/Users/nakayamamasayuki/.ssh/id_ed25519_sinvps_macbook`
- **設定ファイル**: `/Users/nakayamamasayuki/.ssh/config`

#### Windows環境
- **SSH鍵**: `D:\github\uchi\docs\関連資料\conohaVPS\[鍵ファイル名]`
- **設定ファイル**: `~/.ssh/config` (WSL) または `%USERPROFILE%\.ssh\config`

### SSH設定ファイル (共通)
```bash
Host conoha-vps
  HostName 160.251.136.92
  User root
  IdentityFile [環境に応じてパス調整]
  IdentitiesOnly yes
```

### 🔧 接続コマンド
```bash
# 直接接続（環境問わず）
ssh root@160.251.136.92 -i [鍵ファイルパス]

# 設定済み接続
ssh conoha-vps
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

### 🖥️ ローカル開発環境 (環境別)

#### Mac環境
- **プロジェクトパス**: `/Users/nakayamamasayuki/Documents/GitHub/uchi`

#### Windows環境  
- **プロジェクトパス**: `D:\github\uchi`

#### 共通設定
- **Node.js**: v18+ (現在: v22.18.0)
- **Next.js**: v15.4.5
- **開発サーバー**: `npm run dev` (ポート3000)
- **環境変数**: `.env.local` (各環境で作成)

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

## 🚨 小さなエラー重視の鉄則 - 最重要事項

### ⚠️ **絶対に軽視してはいけない原則**
**「小さなエラーやイシューこそが最も重要である」**

小さなエラー・トライ&エラーを解決していくことが、長期的に見て家族のための大切な記録プロジェクトを安定運営するための**最も重要な情報資産**です。

#### 🔥 重大な教訓: B005 VPS 502エラー事件 (2025年8月15日)
- **24分間の完全ダウンタイム** - 家族の記録が一切アクセス不可
- **根本原因**: VPS本番ビルド実行忘れ（わずか1コマンドの漏れ）
- **真の問題**: 「小さなミス」を軽視した結果の重大障害

### 🎯 小さなエラー管理の絶対ルール

#### 1. **一切の軽視禁止**
- ❌ 「小さいから後で」は絶対禁止
- ❌ 「動いているから大丈夫」の過信禁止
- ❌ 表面的解決での満足禁止
- ✅ **どんなに小さくても徹底分析**

#### 2. **完全記録・分析義務**
- 🔍 **根本原因の完全解明**: 表面原因では不十分
- 📋 **必ずISSUE記録**: PROJECT_MANAGEMENT.mdに詳細登録
- 🔄 **関連エラー予測**: 同種問題の先制対策
- 📚 **教訓体系化**: 二度と同じミスを繰り返さない

#### 3. **予防策の徹底実装**
- 📝 **チェックリスト化**: 手順の明文化
- 🤖 **自動化推進**: 人的ミス削減
- 🔔 **アラート設定**: 問題の早期検知
- 📈 **継続改善**: システムの段階的強化

### 🚨 B005事件から学ぶ重要事項

#### ❌ 今回の重大な失敗
1. **工程漏れ**: git pull後の本番ビルド実行忘れ
2. **確認不足**: .next状態の検証漏れ  
3. **表面的対応**: 症状だけ見て根本原因を軽視

#### ✅ 絶対に遵守すべき改善策
```bash
# VPS作業時の絶対チェックリスト
cd /var/www/uchi
git pull origin main
npm run build  # ← 絶対に忘れてはいけない
ls -la .next/  # ビルド確認必須
systemctl restart uchi-app  # サービス再起動
```

#### 🛡️ 関連エラー完全予防
- **依存関係更新時**: 必ず再ビルド
- **環境変数変更時**: 適用確認必須
- **Prismaスキーマ変更時**: generate + build連携
- **設定ファイル変更時**: 整合性チェック

### 🎖️ 品質向上の心得

#### 💎 **品質への妥協なき姿勢**
- 小さなエラーは将来の大きな障害の前兆
- 手抜きの積み重ねは必ず重大事故を引き起こす  
- **安定運用は細部への完璧な注意から生まれる**

#### 📈 **継続的改善の実践**
- 毎回の小さな改善が長期的な安定につながる
- 問題の根本解決は次回以降の作業効率を飛躍的に向上させる
- **完璧主義は効率性の最大の味方**

---

## 🚨 エラー・後回し管理ワークフロー

### 🎯 基本方針
**「後回しの連鎖を断ち切る - 一つずつ確実に解決」**

### 📋 必須手順

#### 1. エラー・問題発生時
- 🔴 **必ずISSUE記録**: `docs/PROJECT_MANAGEMENT.md`に即座に登録
- 📝 **分類**: バグ(B), 環境(E), 機能(F), プロセス(P)で分類
- ⏰ **優先度設定**: 🔥最高/🔴高/🟡中/🔵低を明確化
- 💬 **詳細記録**: エラー内容、発生条件、影響範囲を記載

#### 2. 後回し・保留する場合
- ✋ **保留理由明記**: なぜ後回しにするのか明確に記載
- 📅 **期限設定**: いつまでに対応するか期限を決める
- 🔗 **依存関係記録**: 他作業との関連性を明記
- 🔔 **定期レビュー**: 週1回保留項目を見直し

#### 3. 解決作業時
- 🎯 **一つに集中**: 複数同時対応せず、一つずつ確実に
- ✅ **完全解決**: 根本原因まで対応、一時しのぎは禁止
- 📊 **検証確認**: 修正後の動作確認を必ず実施
- 📝 **結果記録**: 解決方法と教訓をCLAUDE.mdに追記

#### 4. 品質確保
- 🧪 **テスト実行**: `npm run build`, `npm run lint`必須
- 🔍 **警告ゼロ目標**: 警告も段階的に解決対象とする
- 📚 **ドキュメント更新**: 解決内容を関連文書に反映
- 🔄 **再発防止**: 同種問題の再発防止策を検討

### ⚠️ 禁止事項
- ❌ エラーを「いったん無視」して別作業を開始
- ❌ 警告を「後で直す」として放置
- ❌ 一時的な応急処置で済ませる
- ❌ ISSUE記録なしで保留・スキップ

### 🎖️ 成功指標
- 📉 未解決ISSUE数の継続的減少
- ⚡ エラー発見から解決までの時間短縮
- 🔄 同種エラーの再発防止率向上
- 📈 全体的なコード品質向上

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

### ⚡ 接続事前チェック・タイムアウト最適化
```bash
# 高速接続診断 (推奨: 作業開始前)
./scripts/connection-check.sh quick

# VPS含む詳細チェック
./scripts/connection-check.sh quick --include-vps

# 個別接続テスト
./scripts/connection-check.sh ssh conoha-vps 10
./scripts/connection-check.sh git
./scripts/connection-check.sh docker

# 問題解決提案
./scripts/connection-check.sh fix
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
- [x] 環境クリーンアップ自動化 (scripts/cleanup-environment.sh)
- [x] 通信タイムアウト最適化 (SSH/Git/Docker設定完了)
- [x] **F001: 簡易POST機能実装** (2025年8月13日完了)
- [x] **F002: 本番環境スマホUI/UX確認** (2025年8月13日完了)

### 進行中 🔄
- 現在進行中の項目なし

### 次期予定 📋
- [ ] **F003: 記事追加ページ調整** (高優先度)
- [ ] F004: カテゴリ→タグ統合
- [ ] F005: ページ構成整理（月別・タグ）
- [ ] F007: 基本検索機能実装

### 🚨 重要な教訓・反省事項
**2025年8月13日の不手際:**
- VPS作業時にCLAUDE.md記載の`./start-with-env.sh`を無視してnpm installを手動実行
- ユーザーから「CLAUDE.mdにさっき書いたでしょ？これ人間のわたしにはまじで不愉快」との指摘
- **対策**: **作業開始時は必ずCLAUDE.mdを最初に確認し、記載手順を最優先で実行する**

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
1. **このCLAUDE.mdを最初に確認** - 特に🚨小さなエラー重視の鉄則
2. **📋 PROJECT_MANAGEMENT.md確認** - 今日の最高/高優先度項目
3. **未解決ISSUE確認** - バグ(B)/プロセス(P)の優先対応項目  
4. **小さなエラー・警告チェック**: 見落としがちな問題の洗い出し
5. **SSH接続テスト**: `ssh conoha-vps "echo 'SSH接続成功'"`  
6. **アプリケーション状態確認**: `curl -I https://uchinokiroku.com/`
7. **VPSビルド状態確認**: `.next`ディレクトリの最新性確認

### 作業終了時の必須事項
1. **小さなエラー・警告の完全記録** - 見落とした問題は必ずPROJECT_MANAGEMENT.mdに登録
2. **VPS作業時の絶対チェック**:
   ```bash
   cd /var/www/uchi
   git pull origin main
   npm run build  # ← 絶対に忘れてはいけない
   ls -la .next/  # ビルド確認必須
   systemctl restart uchi-app
   ```
3. 変更内容のコミット・プッシュ
4. **品質確認**: `npm run build`で警告チェック
5. **最終動作確認**: `curl -I https://uchinokiroku.com/`
6. 次回作業メモの更新

---

**最終更新**: 2025年8月15日 21:20  
**管理者**: Claude Code Assistant + 中山雅之  
**重要度**: 🔥 必読・常時参照

**🎯 目標**: SSH接続30秒以内、効率的で安定した開発環境の維持  
**📝 重要教訓**: CLAUDE.md記載手順の厳守（2025年8月13日反省事項）  
**🚨 新方針**: エラー・後回し管理ワークフロー導入（2025年8月15日）  
**🔥 最重要**: 小さなエラー重視の鉄則確立（2025年8月15日B005事件教訓）**