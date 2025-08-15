// カテゴリ→タグ移行スクリプト
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 カテゴリ→タグ移行を開始します...')
  
  try {
    // 1. カテゴリを持つ記事を取得
    const articlesWithCategory = await prisma.article.findMany({
      where: {
        category: {
          not: null,
          not: ''
        }
      },
      select: {
        id: true,
        title: true,
        category: true,
        tags: true
      }
    })
    
    console.log(`📊 ${articlesWithCategory.length}件の記事にカテゴリが設定されています`)
    
    if (articlesWithCategory.length === 0) {
      console.log('✅ 移行対象のカテゴリデータはありません')
      return
    }
    
    let migratedCount = 0
    
    // 2. 各記事のカテゴリをタグに追加
    for (const article of articlesWithCategory) {
      const currentTags = article.tags || []
      const category = article.category
      
      // カテゴリがタグに含まれていない場合のみ追加
      if (category && !currentTags.includes(category)) {
        const newTags = [category, ...currentTags]
        
        await prisma.article.update({
          where: { id: article.id },
          data: { 
            tags: newTags
          }
        })
        
        console.log(`✅ "${article.title}": カテゴリ"${category}"をタグに追加`)
        migratedCount++
      } else {
        console.log(`⏭️ "${article.title}": カテゴリ"${category}"は既にタグに含まれています`)
      }
    }
    
    console.log(`🎉 ${migratedCount}件の記事でカテゴリをタグに移行しました`)
    
    // 3. 移行結果を確認
    const updatedArticles = await prisma.article.findMany({
      where: {
        id: { in: articlesWithCategory.map(a => a.id) }
      },
      select: {
        title: true,
        category: true,
        tags: true
      }
    })
    
    console.log('\n📋 移行結果:')
    updatedArticles.forEach(article => {
      console.log(`  "${article.title}": category="${article.category}" → tags=[${article.tags.join(', ')}]`)
    })
    
    console.log('\n⚠️  次のステップ: categoryフィールドを削除するマイグレーションを実行してください')
    console.log('   npx prisma migrate dev --name remove-category-field')
    
  } catch (error) {
    console.error('❌ 移行中にエラーが発生しました:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()