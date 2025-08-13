// データベース接続テスト用スクリプト
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 データベース接続テスト開始...');
    
    // 1. データベース接続確認
    await prisma.$connect();
    console.log('✅ データベース接続成功');

    // 2. Users テーブル読み込みテスト
    const userCount = await prisma.user.count();
    console.log('✅ Users テーブル読み込み成功:', userCount, '件');

    // 3. Accounts テーブル読み込みテスト
    const accountCount = await prisma.account.count();
    console.log('✅ Accounts テーブル読み込み成功:', accountCount, '件');

    // 4. テストユーザー作成（NextAuth形式）
    console.log('🧪 テストユーザー作成中...');
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test-oauth@example.com',
        name: 'Test OAuth User',
        image: 'https://example.com/avatar.jpg',
      },
    });
    
    console.log('✅ テストユーザー作成成功:', testUser.id);

    // 5. テストアカウント作成（OAuth Provider形式）
    const testAccount = await prisma.account.create({
      data: {
        userId: testUser.id,
        type: 'oauth',
        provider: 'line',
        providerAccountId: 'test-line-id-12345',
        access_token: 'test-access-token',
        token_type: 'bearer',
        scope: 'openid profile',
      },
    });

    console.log('✅ テストアカウント作成成功:', testAccount.id);

    // 6. クリーンアップ
    await prisma.account.delete({ where: { id: testAccount.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ テストデータクリーンアップ完了');

    console.log('🎉 データベーステスト完全成功！');
    
  } catch (error) {
    console.error('❌ データベーステストエラー:', error.message);
    console.error('詳細:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();