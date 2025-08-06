const http = require('http');
const url = require('url');
const { Client } = require('pg');

// PostgreSQL接続設定
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'uchinokiroku',
  user: 'uchi_user',
  password: 'uchi_secure_2025',
};

// データベース関数
async function getArticles() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM articles ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('データベースエラー:', error);
    return [];
  } finally {
    await client.end();
  }
}

async function getArticleById(id) {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM articles WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('データベースエラー:', error);
    return null;
  } finally {
    await client.end();
  }
}

// ルーティング関数
function router(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`リクエスト: ${req.method} ${pathname}`);
  
  // 共通ヘッダー
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  // ルーティング
  if (pathname === '/') {
    homePage(req, res);
  } else if (pathname === '/articles') {
    articlesPage(req, res);
  } else if (pathname.startsWith('/articles/')) {
    const articleId = pathname.split('/articles/')[1];
    articleDetailPage(req, res, articleId);
  } else if (pathname === '/api/test') {
    apiTest(req, res);
  } else if (pathname === '/api/articles') {
    apiArticles(req, res);
  } else {
    notFoundPage(req, res);
  }
}

// ホームページ（あいことば画面）
function homePage(req, res) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>🏡 うちのきろく</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0; padding: 0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem; border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center; max-width: 400px; width: 90%;
    }
    h1 { color: #333; margin-bottom: 1.5rem; font-size: 2rem; }
    input[type="password"] {
      padding: 12px; border: 2px solid #ddd; border-radius: 8px;
      font-size: 16px; width: 100%; box-sizing: border-box;
      margin-bottom: 1rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border: none; padding: 12px 24px;
      border-radius: 8px; font-size: 16px; cursor: pointer;
      width: 100%; margin-top: 10px;
    }
    button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏡 うちのきろく</h1>
    <p>あいことばを入力してください</p>
    <input type="password" id="password" placeholder="あいことば" onkeypress="handleKeyPress(event)">
    <button onclick="checkPassword()">入る</button>
  </div>
  
  <script>
    function handleKeyPress(event) {
      if (event.key === 'Enter') {
        checkPassword();
      }
    }
    
    function checkPassword() {
      const password = document.getElementById('password').value;
      if (password === 'uchi_family_2025') {
        alert('✅ 認証成功！記事管理画面に移動します');
        window.location.href = '/articles';
      } else {
        alert('❌ あいことばが違います');
        document.getElementById('password').value = '';
      }
    }
  </script>
</body>
</html>`;
  
  res.writeHead(200);
  res.end(html);
}

// 記事一覧ページ（データベース連携版）
async function articlesPage(req, res) {
  try {
    const articles = await getArticles();
    
    let articlesHtml = '<p>記事が見つかりませんでした。</p>';
    
    if (articles.length > 0) {
      articlesHtml = articles.map(article => `
        <div class="article-card">
          <h3><a href="/articles/${article.id}">${article.title}</a></h3>
          <div class="meta">
            <span class="category">${article.category || '未分類'}</span>
            <span class="date">${new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
          <p class="content-preview">${article.content.substring(0, 100)}...</p>
          ${article.tags && article.tags.length > 0 ? `
            <div class="tags">
              ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
    }
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>📚 記事一覧 - うちのきろく</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      margin: 0; padding: 20px; min-height: 100vh;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      background: white; padding: 2rem; border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 2rem;
      text-align: center;
    }
    h1 { color: #333; margin: 0; }
    nav { margin-top: 1rem; }
    nav a {
      color: #667eea; text-decoration: none; margin: 0 15px;
      padding: 8px 16px; border-radius: 6px; transition: all 0.3s;
    }
    nav a:hover { background: #667eea; color: white; }
    .article-card {
      background: white; padding: 1.5rem; border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08); margin-bottom: 1.5rem;
      transition: transform 0.2s;
    }
    .article-card:hover { transform: translateY(-2px); }
    .article-card h3 { margin: 0 0 10px 0; }
    .article-card h3 a { color: #333; text-decoration: none; }
    .article-card h3 a:hover { color: #667eea; }
    .meta {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px; font-size: 0.9rem; color: #666;
    }
    .category {
      background: #e3f2fd; color: #1976d2; padding: 4px 8px;
      border-radius: 4px; font-size: 0.8rem;
    }
    .content-preview { color: #666; line-height: 1.5; margin: 10px 0; }
    .tags { margin-top: 10px; }
    .tag {
      background: #f5f5f5; color: #555; padding: 3px 8px;
      border-radius: 12px; font-size: 0.8rem; margin-right: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 記事一覧</h1>
      <nav>
        <a href="/">🏠 ホーム</a>
        <a href="/articles">📚 記事一覧</a>
        <a href="/api/test">🔧 API テスト</a>
      </nav>
    </div>
    
    <div class="articles">
      ${articlesHtml}
    </div>
  </div>
</body>
</html>`;
    
    res.writeHead(200);
    res.end(html);
  } catch (error) {
    console.error('記事一覧取得エラー:', error);
    res.writeHead(500);
    res.end('サーバーエラーが発生しました');
  }
}

// 記事詳細ページ
async function articleDetailPage(req, res, articleId) {
  try {
    const article = await getArticleById(parseInt(articleId));
    
    if (!article) {
      notFoundPage(req, res);
      return;
    }
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${article.title} - うちのきろく</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      margin: 0; padding: 20px; min-height: 100vh;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      background: white; padding: 2rem; border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 2rem;
      text-align: center;
    }
    nav a {
      color: #667eea; text-decoration: none; margin: 0 15px;
      padding: 8px 16px; border-radius: 6px; transition: all 0.3s;
    }
    nav a:hover { background: #667eea; color: white; }
    .article {
      background: white; padding: 2rem; border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .article-title { color: #333; margin-bottom: 1rem; }
    .article-meta {
      color: #666; margin-bottom: 2rem; padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    .article-content { line-height: 1.8; color: #444; }
    .category {
      background: #e3f2fd; color: #1976d2; padding: 4px 8px;
      border-radius: 4px; font-size: 0.9rem; margin-right: 10px;
    }
    .tags { margin-top: 1rem; }
    .tag {
      background: #f5f5f5; color: #555; padding: 4px 10px;
      border-radius: 12px; font-size: 0.9rem; margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <nav>
        <a href="/">🏠 ホーム</a>
        <a href="/articles">📚 記事一覧</a>
        <a href="/api/test">🔧 API テスト</a>
      </nav>
    </div>
    
    <article class="article">
      <h1 class="article-title">${article.title}</h1>
      <div class="article-meta">
        <span class="category">${article.category || '未分類'}</span>
        <span>作成日: ${new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
        ${article.tags && article.tags.length > 0 ? `
          <div class="tags">
            タグ: ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="article-content">
        ${article.content.replace(/\n/g, '<br>')}
      </div>
    </article>
  </div>
</body>
</html>`;
    
    res.writeHead(200);
    res.end(html);
  } catch (error) {
    console.error('記事詳細取得エラー:', error);
    res.writeHead(500);
    res.end('サーバーエラーが発生しました');
  }
}

// API: 記事一覧（JSON）
async function apiArticles(req, res) {
  try {
    const articles = await getArticles();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      count: articles.length,
      articles: articles
    }, null, 2));
  } catch (error) {
    console.error('API記事一覧エラー:', error);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(500);
    res.end(JSON.stringify({
      status: 'error',
      message: 'データベースエラーが発生しました'
    }));
  }
}

// API テストページ
function apiTest(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.writeHead(200);
  res.end(JSON.stringify({
    status: 'success',
    message: 'うちのきろく API v2.0 - データベース連携版',
    timestamp: new Date().toISOString(),
    endpoints: {
      home: '/ - ホームページ（あいことば画面）',
      articles: '/articles - 記事一覧',
      articleDetail: '/articles/:id - 記事詳細',
      apiTest: '/api/test - API テスト',
      apiArticles: '/api/articles - 記事一覧JSON'
    }
  }, null, 2));
}

// 404ページ
function notFoundPage(req, res) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>404 - ページが見つかりません</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0; padding: 0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem; border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center; max-width: 400px; width: 90%;
    }
    h1 { color: #333; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>お探しのページが見つかりませんでした。</p>
    <p><a href="/">🏠 ホームに戻る</a></p>
  </div>
</body>
</html>`;
  
  res.writeHead(404);
  res.end(html);
}

// サーバー起動
const server = http.createServer(router);
const PORT = 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('🎉 うちのきろく v2.0 サーバー起動成功！');
  console.log(`🌐 アクセス先: http://160.251.136.92:${PORT}`);
  console.log('📝 利用可能ルート:');
  console.log('   / - ホーム（あいことば画面）');
  console.log('   /articles - 記事一覧（データベース連携）');
  console.log('   /articles/:id - 記事詳細');
  console.log('   /api/test - API テスト');
  console.log('   /api/articles - 記事一覧JSON');
});