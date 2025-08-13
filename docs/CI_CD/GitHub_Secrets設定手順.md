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

#### 設定値 (重要: 改行を含む完全な形式):
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAsiA+9oz1DhGIgvd/74edYtWTy7VI5LUXuDFh9wLUjg46e2vA
ABSzPvd/h5dqEsp/uQZgpL8ewrWXFnVaigxqzHv20Xh1LlIIGuZS4PIp/rslOoki
xz7Ne5odtn0gTclzHRwqS4IWCbnD/8lZIewuBzKk/B/tM7QlE0wCSNJ8CdltuguH
mWuZDYrTogOQE/s6u5UnRvftAMQIsScSy7fYTG2kOmb4+83ceGwmqW9gWVHuSgC9
M1lDZPsZhIVCC2plb73eRkmfQcEDpQmGLLq3Ab3437UjRw6F/d6P+cxCz33e2Opd
Q0Qp3qWfT5sbwSFycbIv6ibn0W+9G7CpTj7fRQIDAQABAoIBAQCTx7T1EBTvSxSa
s4Ps0fJ9YPxxcUG8nZHEOxQvvqViBeP3KXntlz7u6p9fevuCA4bblrLve7Clkcp7
03j+NzcT13T6bJmriFs5FgWEouS8db95RPUZoL0R4tbr4/u9DXj3mbptUsu93eUC
faX5Qt0dE6NVmZdN4hMwY0sx548JC3q31QMm3aQjCF7EqoWyekKmeOtyO+fNsNSO
/gv+LUsVlLCE3UAea6/ZAyj/56b28aZe7klNZkNX8lxD/gmMIIEn9lAmgW0Nw7o7
dZ+hnNa41ygUqhbx8CTfnPyKYL4OEE4XCH5cWAUUOZfTGoR9+xT/Pwj00C9Kb7sB
bQM+df0BAoGBAOuOIaNND71JlZNV8yktnNYe+fgsCk+p/Pv0XtvNiIaJfCcWof74
SenUbxZ0GX1SF71UCYUSFgCC6JOQFm1tmNoBtbwP7JuPNH9vBo1b8YbNrIqr8fdQ
rkXhCem141Jqqm1LS5kcGZKgnP8xDpr6FXzE+fy7QGYMP3gY97inppSRAoGBAMGW
E+naym7ZidsLepdkBjEUoeEtY0ZltZStLQipgS50WnSQM+sjFLB1FGNhWH27Ho6F
gmodYpijodfUobEbDMARBFj+jZZf2Tlj8k8OdmVXxFxPvQPdyLlTCvHnCYmNHjEg
u6//XE3F09Xw/8Om5oFUtjPheL8UMtL4U47CFel1AoGAF/Oz5+8GErFQzFKJDz7c
G8m6kUmpIsCeQOBwZNlZcJS6Ux8yCcMlgOlhAl972Apo74+ECEv2gMbO73JPVYE3
cbOKzzyvSoIdTHf1qpoWzSZMzSz+xa8miWSApYshOlguTD7DySXaU9aRIEHUwl17
odxFrzU7LyU/ru6bAePKRIECgYAMaLtkDTNWwbkVgnncRHwlH0Z1MbygYZqvKh6t
5He0a570w92gIAKOgSLKcA4FGT6PMj224aVVVX/lXuryeGJr2Wtm7QJUdlZtWFvK
94ldW6/pnu7l1YytXIZiFUZGO/aIfamqUXswPRMkLqumdgdmmPCJCNX9oaTUYziv
+P8AlQKBgHTw4CGxvnOP7Da0yZcnaKac9+4ulh1uqo/CP6T7emrm3PB0PDwbRFkg
kr4SW/tQ3Y8QwXS3ep0m97T7JY4Pcs10+kFeh8+8ewTWCnajPHveB1iJt7SRDKAg
aKtqRxa/Z7vi9xedKySspJAF0SjjhfifSWopK6rUCzS2POyWOwvy
-----END RSA PRIVATE KEY-----
```

**⚠️ 超重要**: 
- 改行を含む完全な形式でコピー&ペースト
- ダッシュの数・スペースも正確に
- 最後に改行があることを確認

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