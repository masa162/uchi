# SSH接続トラブルシューティング

**状況**: GitHub ActionsでのVPS SSH接続に失敗

---

## 🔍 現在のエラー分析

### エラー内容:
```
Load key "/home/runner/.ssh/id_rsa": error in libcrypto
root@160.251.136.92: Permission denied (publickey).
```

### 原因候補:
1. **GitHub Secrets未設定**: `VPS_SSH_KEY` が設定されていない
2. **SSH鍵形式問題**: 鍵の改行・エンコーディング問題
3. **権限設定問題**: SSH鍵ファイルの権限設定

---

## 🔧 解決手順

### **Step 1: GitHub Secrets確認**

#### 設定画面アクセス:
```
https://github.com/masa162/uchi/settings/secrets/actions
```

#### 確認項目:
- [ ] `VPS_SSH_KEY` が存在するか
- [ ] 値が正しく設定されているか

### **Step 2: SSH鍵の正確な設定**

#### 鍵ファイルの内容を再確認:
```bash
# ローカルで鍵ファイルの内容表示
cat /Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem
```

#### GitHub Secretsに設定すべき内容:
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

**⚠️ 重要**: 
- 開始行・終了行を含む全体をコピー
- 空白や改行を維持
- ダッシュの数も正確に

---

## 🧪 設定テスト方法

### **Step 3: デプロイワークフロー修正をプッシュ**

修正されたワークフローをプッシュして再テスト:

```bash
git add .github/workflows/deploy.yml
git commit -m "fix: SSH接続設定修正・デバッグ機能追加"
git push origin main
```

### **Step 4: 実行ログ確認**

GitHub Actions実行ログで以下を確認:
- [ ] SSH鍵形式チェック結果
- [ ] 初期接続テスト結果
- [ ] 詳細なエラーメッセージ

---

## 🔄 代替手段

### **Option A: SSH Action使用**

もしSSH設定が困難な場合、専用のGitHub Actionを使用:

```yaml
- name: 🚀 Deploy via SSH Action
  uses: appleboy/ssh-action@v0.1.5
  with:
    host: ${{ env.VPS_HOST }}
    username: ${{ env.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script: |
      cd ${{ env.APP_PATH }}
      git pull origin main
      npm ci --only=production
      npm run build
      # 再起動処理
```

### **Option B: VPS側での自動プル設定**

VPS側にcronジョブで定期的にgit pullする仕組み:

```bash
# VPS上で設定
crontab -e
*/5 * * * * cd /var/www/uchi && git pull origin main && npm run build 2>&1 | logger
```

---

## 🚨 緊急時の手動デプロイ

### SSH接続が解決するまでの手動デプロイ手順:

```bash
# 1. ローカルからVPSへのSCP転送
scp -i /Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem -r . root@160.251.136.92:/var/www/uchi/

# 2. VPSでビルド・再起動
ssh -i /Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem root@160.251.136.92 "
  cd /var/www/uchi
  npm ci --only=production
  npm run build
  pkill -f next || true
  nohup ./start-with-env.sh > deploy.log 2>&1 &
"
```

---

## ✅ チェックリスト

### GitHub Secrets設定:
- [ ] リポジトリSettings → Secrets and variables → Actions
- [ ] VPS_SSH_KEY作成・値設定
- [ ] SSH鍵内容の正確性確認

### ワークフロー修正:
- [ ] SSH設定の改良版デプロイ
- [ ] ログ確認・エラー詳細把握
- [ ] 必要に応じて代替手段の検討

設定完了後、再度自動デプロイをテストしてください。