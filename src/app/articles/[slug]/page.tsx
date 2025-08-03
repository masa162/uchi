'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

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
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchArticle()
  }, [params.slug])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data)
      } else if (response.status === 404) {
        setError('記事が見つかりません')
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

  // Markdown風のテキストを簡易的にHTMLに変換
  const formatContent = (content: string) => {
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
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
                記事一覧
              </button>
              <button
                onClick={() => router.push('/articles/new')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                新しい記事
              </button>
              <span className="text-gray-700">
                こんにちは、{user.email}さん
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/articles')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
              >
                記事一覧に戻る
              </button>
            </div>
          ) : article ? (
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {article.heroImageUrl && (
                <div className="w-full h-64 md:h-96 overflow-hidden">
                  <img
                    src={article.heroImageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <header className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {article.title}
                  </h1>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>
                      投稿者: {article.author.name || article.author.email}
                    </span>
                    <span>
                      {formatDate(article.pubDate)}
                    </span>
                  </div>
                  
                  {article.description && (
                    <p className="text-lg text-gray-600 mb-6">
                      {article.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {article.category && (
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
                        📁 {article.category}
                      </span>
                    )}
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </header>
                
                <div 
                  className="prose max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: formatContent(article.content)
                  }}
                />
              </div>
            </article>
          ) : null}
        </div>
      </main>
    </div>
  )
}