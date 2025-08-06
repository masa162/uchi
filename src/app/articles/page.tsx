'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Article {
  id: string
  title: string
  slug: string
  description?: string
  content: string
  pubDate: string
  category?: string
  tags: string[]
  heroImageUrl?: string
  author: {
    id: string
    name?: string
    email: string
  }
  _count: {
    comments: number
    likes: number
  }
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      } else {
        setError('記事の取得に失敗しました')
      }
    } catch (error) {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ログインが必要です</p>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <nav className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-xl font-semibold hover:text-gray-600"
              >
                うちのきろく
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/articles/new')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                新しい記事
              </button>
              <span className="text-gray-700">
                こんにちは、{user.email}さん
              </span>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">記事一覧</h1>
        </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>読み込み中...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-600 mb-4">
                    まだ記事がありません
                  </h2>
                  <p className="text-gray-500 mb-6">
                    最初の記事を投稿してみましょう！
                  </p>
                  <button
                    onClick={() => router.push('/articles/new')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                  >
                    記事を投稿する
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((article) => (
                    <article
                      key={article.id}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/articles/${article.slug}`)}
                    >
                      {article.heroImageUrl && (
                        <img
                          src={article.heroImageUrl}
                          alt={article.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          {article.title}
                        </h2>
                        
                        {article.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {article.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>
                            {article.author.name || article.author.email}
                          </span>
                          <span>
                            {formatDate(article.pubDate)}
                          </span>
                        </div>
                        
                        {article.category && (
                          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mb-2">
                            {article.category}
                          </span>
                        )}
                        
                        {article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {article.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{article.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>💬 {article._count.comments}</span>
                          <span>❤️ {article._count.likes}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
      </div>
    </AuthenticatedLayout>
  )
}