'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Article {
  id: string
  title: string
  slug: string
  description?: string
  pubDate: string
  category?: string
  tags: string[]
  heroImageUrl?: string
  author: {
    name?: string
    email: string
  }
}

export default function CategoryArticlePage({ params }: { params: { category: string } }) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const category = decodeURIComponent(params.category)

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (category) {
      fetchArticles()
    }
  }, [category])

  const fetchArticles = async () => {
    try {
      const response = await fetch(`/api/articles/category/${category}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
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
                onClick={() => router.push('/articles')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                全ての記事
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            カテゴリ: <span className="text-indigo-600">{category}</span>
          </h1>

          {loading ? (
            <div className="text-center py-12">...</div>
          ) : error ? (
            <div className="text-center py-12">...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-600">このカテゴリの記事はありません</h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/articles/${article.slug}`)}
                >
                  {article.heroImageUrl && (
                    <img src={article.heroImageUrl} alt={article.title} className="w-full h-48 object-cover rounded-t-lg" />
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
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
