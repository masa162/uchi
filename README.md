# うちのきろく - 新システム

家族向けのクローズドなアーカイブサイトです。.hello


## 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript
- **スタイリング**: Tailwind CSS + DaisyUI
- **バックエンド**: Supabase (PostgreSQL, Authentication, Storage)
- **ホスティング**: Vercel (予定)

## セットアップ手順

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の変数を設定してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration  
NEXT_PUBLIC_SITE_PASSWORD=your_site_password
```

### 2. Supabaseプロジェクトの設定

1. Supabaseプロジェクトを作成
2. `supabase/migrations/20250803000001_initial_schema.sql` を実行してデータベーススキーマを作成
3. Authentication > Settings で以下を設定：
   - Email Signups: 有効
   - Email confirmations: 有効（推奨）
4. Storage でバケットを作成（画像アップロード用）

### 3. 開発サーバーの起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセスできます。

## 機能概要

### 実装済み
- ✅ 「あいことば」による初回アクセス制限
- ✅ Supabase Authentication（メール/パスワード）
- ✅ 基本的なユーザー認証フロー
- ✅ データベーススキーマ（articles, profiles, comments, likes）
- ✅ Row Level Security (RLS) ポリシー

### 予定
- 📝 記事投稿機能（Markdownエディタ）
- 📝 記事一覧・詳細表示
- 📝 コメント機能
- 📝 いいね機能
- 📝 画像アップロード機能
- 📝 現行サイトのUI/UX再現
- 📝 検索機能
- 📝 タグ・カテゴリ機能

## データベーススキーマ

### profiles テーブル
- ユーザープロフィール情報

### articles テーブル
- 記事コンテンツ（Markdown形式）
- タイトル、スラッグ、説明、公開日など

### comments テーブル
- 記事へのコメント

### likes テーブル
- 記事へのいいね

## デプロイ

Vercelにデプロイする際は、環境変数を設定してください。

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add NEXT_PUBLIC_SITE_PASSWORD
```
