# Claude Code 開発環境情報

## 🔑 SSH接続情報

### ConoHa VPS
- **IPアドレス**: `160.251.136.92`
- **ユーザー**: `root`
- **SSH鍵**: `/Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem`
- **接続コマンド**: 
  ```bash
  ssh -i "/Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem" root@160.251.136.92
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
# SSH接続
ssh -i "/Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem" root@160.251.136.92

# ファイル転送
scp -i "/Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem" [local_file] root@160.251.136.92:[remote_path]

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
1. SSH鍵のパスを確認: `/Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem`
2. 鍵の権限確認: `chmod 600 [key_file]`
3. SSH agentに追加: `ssh-add [key_file]`

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

**最終更新**: 2025年8月13日  
**管理者**: Claude Code Assistant  
**重要度**: 🔥 必読・常時参照