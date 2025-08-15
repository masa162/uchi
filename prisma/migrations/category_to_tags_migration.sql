-- F004: カテゴリ→タグ統合マイグレーション
-- 作成日: 2025-08-15
-- 目的: categoryフィールドをtagsに統合し、データ損失なく移行

-- Step 1: 既存データの確認（マイグレーション前）
-- SELECT 
--   COUNT(*) as total_articles,
--   COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as articles_with_category,
--   COUNT(CASE WHEN array_length(tags, 1) > 0 THEN 1 END) as articles_with_tags
-- FROM articles;

-- Step 2: カテゴリをタグの先頭に追加（重複除去付き）
UPDATE articles 
SET tags = CASE 
  WHEN category IS NOT NULL AND category != '' AND NOT (category = ANY(tags))
  THEN array_prepend(category, tags)
  WHEN category IS NOT NULL AND category != '' AND (category = ANY(tags))
  THEN tags  -- 既にタグに含まれている場合はそのまま
  ELSE tags
END
WHERE category IS NOT NULL AND category != '';

-- Step 3: 空のタグ配列を持つ記事で、カテゴリがある場合の処理
UPDATE articles 
SET tags = ARRAY[category]
WHERE category IS NOT NULL 
  AND category != '' 
  AND (tags IS NULL OR array_length(tags, 1) IS NULL);

-- Step 4: 移行後のデータ確認
-- SELECT 
--   id,
--   title,
--   category,
--   tags,
--   array_length(tags, 1) as tag_count
-- FROM articles 
-- WHERE category IS NOT NULL
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Step 5: カテゴリフィールドを削除（本番実行時）
-- ALTER TABLE articles DROP COLUMN category;