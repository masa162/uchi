'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  tags: string[]
  category: string
  createdAt: string
  author: {
    name: string
    email: string
  }
}

export default function SearchPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialQuery = searchParams.get('q') || ''

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setArticles([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('検索エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🔍 記事検索</h1>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="記事を検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="sr-only">検索</span>
                <svg className="h-5 w-5 text-indigo-600 hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">検索中...</span>
          </div>
        )}

        {!loading && initialQuery && (
          <div className="mb-4">
            <p className="text-gray-600">
              「<span className="font-semibold">{initialQuery}</span>」の検索結果: {articles.length}件
            </p>
          </div>
        )}

        {!loading && articles.length === 0 && initialQuery && (
          <div className="text-center py-8">
            <p className="text-gray-500">検索結果が見つかりませんでした。</p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link 
                      href={`/articles/${article.slug}`}
                      className="block hover:no-underline"
                    >
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                        {article.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {article.content}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {article.category}
                        </span>
                        <span>
                          {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                        <span>by {article.author.name}</span>
                      </div>
                    </div>

                    {article.tags.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}