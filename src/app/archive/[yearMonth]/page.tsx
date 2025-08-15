'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  tags: string[]
  createdAt: string
  author: {
    name: string
    email: string
  }
}

export default function ArchiveDetailPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [yearMonth, setYearMonth] = useState('')
  const [year, setYear] = useState(0)
  const [month, setMonth] = useState(0)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.yearMonth) {
      fetchArchiveDetail(params.yearMonth as string)
    }
  }, [params.yearMonth])

  const fetchArchiveDetail = async (yearMonthParam: string) => {
    try {
      const response = await fetch(`/api/articles/archive/${yearMonthParam}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
        setYearMonth(data.yearMonth)
        setYear(data.year)
        setMonth(data.month)
      } else {
        console.error('アーカイブが見つかりませんでした')
      }
    } catch (error) {
      console.error('アーカイブの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: number) => {
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ]
    return monthNames[month - 1]
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="py-6">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button 
              onClick={() => router.push('/archive')}
              className="hover:text-indigo-600 transition-colors"
            >
              📂 月別アーカイブ
            </button>
            <span>&gt;</span>
            <span className="text-gray-900">
              {year}年 {getMonthName(month)}
            </span>
          </nav>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {year}年 {getMonthName(month)}の記事
          </h1>
          <p className="text-gray-600">
            {articles.length}件の記事があります
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">この月には記事がありません。</p>
          </div>
        ) : (
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
                    
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {article.content}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          {new Date(article.createdAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span>by {article.author.name}</span>
                      </div>
                    </div>

                    {article.tags.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => router.push(`/tags/${tag}`)}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-200 cursor-pointer transition-colors"
                            >
                              #{tag}
                            </button>
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