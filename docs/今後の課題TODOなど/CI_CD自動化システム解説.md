# CI/CD自動化システム解説

**作成日**: 2025年8月13日  
**目的**: CI/CDの概念と具体的な実装方法の解説

---

## 🤔 CI/CDとは？

### **CI (Continuous Integration - 継続的インテグレーション)**
- **何をするもの？**: コードを変更するたびに、自動でテスト・ビルド・品質チェックを実行
- **なぜ必要？**: 「動いていたものが突然壊れる」を防ぐ
- **具体例**: コードをプッシュすると「テスト実行→ビルド確認→エラーがあれば通知」

### **CD (Continuous Deployment - 継続的デプロイ)**
- **何をするもの？**: テストが通ったコードを自動で本番環境（VPS）にデプロイ
- **なぜ必要？**: 手動デプロイの手間とミスを削減
- **具体例**: mainブランチにマージされると「自動でVPSにデプロイ→サービス再起動」

---

## 📋 プルリクエスト時の自動テスト実行とは？

### **現在の問題**
```
👩‍💻 開発者: 「新機能追加したからVPSにアップしよう」
🤖 VPS: 「エラーで起動しません」
👩‍💻 開発者: 「あれ？ローカルでは動いてたのに...」
😱 結果: サイトが停止してしまう
```

### **自動テスト実行の流れ**
```
1. 👩‍💻 プルリクエスト作成
   ↓
2. 🤖 GitHub Actions自動実行:
   - Next.jsビルドテスト
   - TypeScript型チェック
   - Prismaマイグレーション確認
   - 認証機能テスト
   ↓
3. ✅ 全テスト成功 → マージ可能
   ❌ テスト失敗 → マージ不可・詳細エラー通知
   ↓
4. 🚀 マージ後、自動でVPSデプロイ
```

### **具体的なテスト例**
```bash
# 実際に実行されるテスト
npm run build          # ビルドエラーチェック
npm run type-check      # TypeScript型エラーチェック
npm run lint           # コード品質チェック
npx prisma validate    # データベーススキーマ検証
npm run test           # 認証・機能テスト
```

---

## 🚨 エラー通知システムとは？

### **現在の問題**
- VPSでエラーが発生しても気づかない
- ユーザーがアクセスできなくても分からない
- いつから問題が発生しているか不明

### **通知システムの仕組み**

#### **1. ビルド・デプロイエラー通知**
```
❌ デプロイ失敗
件名: [うちのきろく] デプロイエラー発生
内容: 
- エラー内容: Prisma migration failed
- 発生時刻: 2025-08-13 10:30
- 影響: サイトは正常稼働中（ロールバック済み）
- 対処: prisma/schema.prismaの修正が必要
```

#### **2. サービス監視通知**
```
🔍 監視システム（毎5分チェック）:
- https://uchinokiroku.com → 200 OK ✅
- データベース接続 → 成功 ✅
- 認証API → 成功 ✅

⚠️ 異常検知時:
件名: [緊急] うちのきろく サービス停止
内容:
- 状況: HTTPSアクセスでタイムアウト
- 発生時刻: 2025-08-13 11:45
- 推定原因: Next.jsプロセス停止
- 自動復旧: 試行中...
```

#### **3. パフォーマンス通知**
```
📊 週次レポート:
- アップタイム: 99.8%
- 平均レスポンス時間: 1.2秒
- エラー率: 0.1%
- 新規ユーザー: 3名
- LINE Login使用率: 80%
```

---

## 🛠️ 具体的な実装内容

### **Phase 1: GitHub Actions基本設定**

#### **ファイル**: `.github/workflows/ci.yml`
```yaml
name: うちのきろく CI/CD

on:
  pull_request:        # プルリク時に実行
    branches: [main]
  push:               # mainブランチプッシュ時に実行
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: コードチェックアウト
        uses: actions/checkout@v4
        
      - name: Node.js環境構築
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: 依存関係インストール
        run: npm ci
        
      - name: TypeScript型チェック
        run: npm run type-check
        
      - name: Lintチェック
        run: npm run lint
        
      - name: ビルドテスト
        run: npm run build
        
      - name: Prismaスキーマ検証
        run: npx prisma validate
```

### **Phase 2: VPS自動デプロイ**

#### **ファイル**: `.github/workflows/deploy.yml`
```yaml
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: VPSにSSH接続してデプロイ
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.VPS_HOST }}      # 160.251.136.92
          username: ${{ secrets.VPS_USER }}   # root
          key: ${{ secrets.VPS_SSH_KEY }}     # SSH秘密鍵
          script: |
            cd /var/www/uchi
            git pull origin main
            npm ci
            npx prisma generate
            npx prisma db push
            pkill -f next || true
            nohup ./start-with-env.sh > deploy.log 2>&1 &
            sleep 10
            curl -f https://uchinokiroku.com || exit 1
```

### **Phase 3: 監視・通知システム**

#### **監視スクリプト**: `scripts/health-check.sh`
```bash
#!/bin/bash
# 5分おきに実行される監視スクリプト

check_website() {
    if ! curl -f -s https://uchinokiroku.com > /dev/null; then
        send_alert "Website Down" "uchinokiroku.com is not responding"
        return 1
    fi
}

check_database() {
    if ! ssh root@160.251.136.92 "cd /var/www/uchi && npx prisma db execute --stdin <<< 'SELECT 1'" > /dev/null; then
        send_alert "Database Error" "Database connection failed"
        return 1
    fi
}

send_alert() {
    # Slack通知
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 $1: $2\"}" \
        $SLACK_WEBHOOK_URL
    
    # メール通知（オプション）
    echo "$2" | mail -s "$1" belong2jazz@gmail.com
}

# 監視実行
check_website
check_database
```

---

## 💡 なぜ今やるべきか？

### **短期的メリット**
1. **デプロイミス防止**: 「あれ？サイトが止まった」がなくなる
2. **効率化**: SCP転送・SSH再起動の手作業が自動化
3. **安心感**: 何かあっても即座に通知される

### **中期的メリット**
4. **開発速度向上**: テストを恐れず新機能開発できる
5. **品質保証**: バグがある状態で本番デプロイしない
6. **チーム開発**: 他の人が参加しても安全に開発可能

### **長期的メリット**
7. **保守性**: システムの健全性を継続監視
8. **拡張性**: 新機能追加時の影響範囲を自動チェック
9. **信頼性**: サービスの安定稼働を保証

---

## 📊 費用対効果

### **コスト**
- **開発時間**: 初期設定 4-6時間
- **維持費用**: 基本的に無料（GitHub Actions無料枠内）
- **学習コスト**: 初回のみ

### **削減効果**
- **デプロイ時間**: 15分 → 3分（自動化）
- **障害対応時間**: 2時間 → 10分（即座通知）
- **品質問題**: 週1回 → 月1回以下
- **ストレス**: 「大丈夫かな？」の心配がゼロ

---

## 🎯 実装優先順位

### **Phase 1 (最重要・今日中)**
1. ✅ **基本CI設定**: ビルド・型チェック・Lint
2. ✅ **プルリクエスト保護**: テスト失敗時のマージ防止

### **Phase 2 (重要・今週中)**
3. ✅ **自動デプロイ**: mainブランチマージ時の自動VPS更新
4. ✅ **基本監視**: サイトアクセス確認

### **Phase 3 (推奨・来週以降)**
5. ⭕ **詳細監視**: データベース・認証API監視
6. ⭕ **通知システム**: Slack・メール通知
7. ⭕ **パフォーマンス監視**: レスポンス時間・エラー率

---

## 💻 技術的実現性

### **現在の環境との相性**
✅ **GitHub**: 既に使用中（リポジトリあり）  
✅ **VPS SSH**: 鍵認証設定済み  
✅ **Next.js**: ビルド・起動スクリプト整備済み  
✅ **環境変数**: 適切に管理されている  
✅ **Prisma**: マイグレーション運用中  

### **必要な追加設定**
- GitHub Secrets設定（SSH鍵・環境変数）
- VPS側の権限調整
- 監視スクリプトの配置

---

## 🚀 今日始めるべき理由

1. **環境が整っている**: 基盤がすべて揃った今がベストタイミング
2. **問題が少ない**: 機能が少ない今なら設定が簡単
3. **学習効果**: 少しずつ動作を見ながら理解できる
4. **リスク低減**: 機能追加前に安全網を構築

**「鉄は熱いうちに打て」- 今が最適なタイミングです！**

---

**次のステップ**: Phase 1の基本CI設定から始めますか？