'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function SimplePostPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()

  // 文字数計算
  const characterCount = content.length
  const maxCharacters = 1000
  const isOverLimit = characterCount > maxCharacters

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!content.trim()) {
      setMessage('内容を入力してください')
      return
    }

    if (isOverLimit) {
      setMessage('文字数が上限を超えています')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/articles/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      if (response.ok) {
        await response.json()
        setShowSuccess(true)
        setContent('') // 投稿後にクリア
        
        // 2秒後に記事一覧にリダイレクト
        setTimeout(() => {
          router.push('/articles')
        }, 2000)
      } else {
        const error = await response.json()
        setMessage(error.message || '投稿に失敗しました')
      }
    } catch (error) {
      console.error('投稿エラー:', error)
      setMessage('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">投稿完了！</h2>
          <p className="text-gray-600 mb-4">記事が投稿されました</p>
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">記事一覧に移動中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
            >
              うちのきろく
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.name || user.email}さん
              </span>
              <button
                onClick={() => router.push('/articles')}
                className="text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-md touch-manipulation"
              >
                記事一覧
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              💭 今日の思い出を一言で...
            </h1>
            <p className="text-gray-600 text-sm">
              シンプルに投稿 - タイトルは自動で生成されます
            </p>
          </div>

          {/* 投稿フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full min-h-[140px] sm:min-h-[180px] p-4 border rounded-lg text-base sm:text-lg leading-relaxed resize-none transition-colors focus:outline-none touch-manipulation ${
                  isOverLimit 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
                placeholder="今日はどんな一日でしたか？&#10;&#10;例：&#10;・家族で公園に行きました&#10;・新しいレシピに挑戦！&#10;・子どもの寝顔が可愛すぎる..."
                disabled={loading}
              />
              
              {/* 文字数カウンター */}
              <div className={`absolute bottom-3 right-3 text-xs ${
                isOverLimit ? 'text-red-500' : 'text-gray-400'
              }`}>
                {characterCount} / {maxCharacters}
              </div>
            </div>

            {/* エラーメッセージ */}
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('完了') || message.includes('成功')
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* ボタンエリア */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <button
                type="button"
                onClick={() => router.push('/articles')}
                className="order-2 sm:order-1 px-6 py-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation min-h-[48px]"
                disabled={loading}
              >
                キャンセル
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => router.push('/articles/new')}
                  className="px-6 py-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm touch-manipulation min-h-[48px]"
                  disabled={loading}
                >
                  詳細モード
                </button>
                
                <button
                  type="submit"
                  disabled={loading || !content.trim() || isOverLimit}
                  className={`px-8 py-4 rounded-md font-medium text-lg transition-all duration-200 touch-manipulation min-h-[48px] ${
                    loading || !content.trim() || isOverLimit
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      投稿中...
                    </span>
                  ) : (
                    '投稿する'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* 使い方のヒント */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使い方のヒント</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• タイトルは投稿日時から自動生成されます</li>
              <li>• カテゴリやタグは後から編集できます</li>
              <li>• 改行や絵文字も使用できます</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}