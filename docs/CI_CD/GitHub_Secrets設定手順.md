# GitHub Secrets 設定手順

**目的**: CI/CDパイプラインでVPSに安全にアクセスするための秘密情報設定

---

## 🔐 必要なSecrets

### **VPS_SSH_KEY**
VPSへのSSH接続用秘密鍵

#### 取得方法:
```bash
# ローカルの秘密鍵を表示
cat /Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem
```

#### 設定値:
```
-----BEGIN RSA PRIVATE KEY-----
[秘密鍵の内容をそのまま貼り付け]
-----END RSA PRIVATE KEY-----
```

---

## ⚙️ 設定手順

### 1. GitHubリポジトリでSecrets設定画面にアクセス
```
https://github.com/masa162/uchi/settings/secrets/actions
```

### 2. 新しいSecret追加
1. **"New repository secret"** をクリック
2. **Name**: `VPS_SSH_KEY`
3. **Value**: 上記の秘密鍵内容を貼り付け
4. **"Add secret"** をクリック

### 3. 設定確認
- **VPS_SSH_KEY**: ✅ 設定済み

---

## 🧪 テスト方法

### SSH接続テスト:
```bash
# ローカルからSSH接続確認
ssh -i /Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem root@160.251.136.92 "echo 'SSH connection test successful'"
```

### GitHub Actions実行テスト:
1. 小さな変更をcommit & push
2. Actions画面で実行結果確認
3. デプロイ成功後、https://uchinokiroku.com アクセス確認

---

## 🚨 セキュリティ注意事項

- ✅ Secretsはリポジトリ外部からアクセス不可
- ✅ ログに出力されない
- ⚠️ 秘密鍵ファイルはローカルで適切に管理
- ⚠️ GitHub Secrets設定後は定期的に見直し

---

## 🔧 トラブルシューティング

### SSH接続エラー
```bash
# 権限確認
ls -la ~/.ssh/
chmod 600 ~/.ssh/id_rsa

# 接続テスト
ssh -v root@160.251.136.92
```

### デプロイエラー
1. GitHub Actions ログ確認
2. VPS側ログ確認: `tail -f /var/www/uchi/deploy.log`
3. プロセス状況確認: `ps aux | grep next`