'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import Link from 'next/link'
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
}

export default function ArticlePage({ params }: { params: Promise<{ slug:string }> }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // コメント関連の状態
  const [comments, setComments] = useState<Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string | null; email?: string };
  }>>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  
  // いいね関連の状態
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()

  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
    const initParams = async () => {
      const { slug } = await params
      setSlug(slug)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (slug) {
      fetchArticle()
      fetchComments()
      fetchLikeStatus()
    }
  }, [slug])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${slug}`)
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

  // コメント取得
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/articles/${slug}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('コメントの取得に失敗しました:', error)
    }
  }

  // いいね状態取得
  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/articles/${slug}/like`)
      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.likeCount)
        setIsLiked(data.isLiked)
      }
    } catch (error) {
      console.error('いいね状態の取得に失敗しました:', error)
    }
  }

  // コメント投稿
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommentLoading(true)
    try {
      const response = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => [...prev, comment])
        setNewComment('')
      }
    } catch (error) {
      console.error('コメント投稿に失敗しました:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  // いいねトグル
  const handleLikeToggle = async () => {
    if (likeLoading) return

    setLikeLoading(true)
    try {
      const response = await fetch(`/api/articles/${slug}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.likeCount)
        setIsLiked(data.isLiked)
      }
    } catch (error) {
      console.error('いいね処理に失敗しました:', error)
    } finally {
      setLikeLoading(false)
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

      <div className="py-6">
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
                      <Link href={`/categories/${article.category}`} className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">
                        📁 {article.category}
                      </Link>
                    )}
                    {article.tags.map((tag, index) => (
                      <Link href={`/tags/${tag}`} key={index} className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </header>
                
                <div 
                  className="prose max-w-none text-gray-800 leading-relaxed"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  >
                    {article.content}
                  </ReactMarkdown>
                </div>

                {/* いいねボタン */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLikeToggle}
                    disabled={likeLoading}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isLiked
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="mr-2">
                      {isLiked ? '❤️' : '🤍'}
                    </span>
                    いいね {likeCount > 0 && `(${likeCount})`}
                  </button>
                </div>

                {/* コメントセクション */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    コメント ({comments.length})
                  </h3>

                  {/* コメント投稿フォーム */}
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="コメントを書く..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={commentLoading}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {commentLoading ? '投稿中...' : 'コメント投稿'}
                      </button>
                    </div>
                  </form>

                  {/* コメント一覧 */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        まだコメントがありません。最初のコメントを投稿しましょう！
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {comment.user.name || comment.user.email}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </article>
          ) : null}
      </div>
    </AuthenticatedLayout>
  )
}