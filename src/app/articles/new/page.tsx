'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// 定義済みカテゴリ
const CATEGORIES = [
  { value: '', label: 'カテゴリを選択してください' },
  { value: '家族', label: '👨‍👩‍👧‍👦 家族' },
  { value: '旅行', label: '✈️ 旅行' },
  { value: '料理', label: '🍳 料理' },
  { value: '子育て', label: '👶 子育て' },
  { value: 'イベント', label: '🎉 イベント' },
  { value: '日記', label: '📝 日記' },
  { value: '健康', label: '💪 健康' },
  { value: '趣味', label: '🎨 趣味' },
  { value: 'その他', label: '📂 その他' }
]

// よく使用されるタグのサジェスト
const SUGGESTED_TAGS = [
  '家族', '思い出', '成長', '記念日', 'お祝い', '誕生日',
  '夏休み', '春', '夏', '秋', '冬', '週末', 
  'おでかけ', '散歩', '公園', '海', '山', 'キャンプ',
  'お料理', 'おやつ', '手作り', 'レシピ', '美味しい',
  '学校', '習い事', 'スポーツ', '読書', 'ゲーム',
  '感謝', '嬉しい', '楽しい', 'がんばり', '初めて'
]

export default function NewArticlePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [usedTags, setUsedTags] = useState<string[]>([])
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { user } = useAuth()
  const router = useRouter()

  // 過去に使用されたタグを取得
  useEffect(() => {
    fetchUsedTags()
  }, [])

  const fetchUsedTags = async () => {
    try {
      const response = await fetch('/api/articles/tags')
      if (response.ok) {
        const data = await response.json()
        setUsedTags(data.tags || [])
      }
    } catch (error) {
      console.log('タグの取得に失敗しました')
    }
  }

  // タグをクリックで追加
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag]
      setSelectedTags(newTags)
      setTags(newTags.join(', '))
    }
  }

  // タグを削除
  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newTags)
    setTags(newTags.join(', '))
  }

  // タグ入力を手動で変更した場合
  const handleTagsChange = (value: string) => {
    setTags(value)
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(Boolean)
    setSelectedTags(tagsArray)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          description,
          category,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          heroImageUrl: heroImageUrl || null,
        }),
      })

      if (response.ok) {
        const article = await response.json()
        setMessage('記事を投稿しました！')
        setTimeout(() => {
          router.push('/articles')
        }, 1500)
      } else {
        const error = await response.json()
        setMessage(error.message || '投稿に失敗しました')
      }
    } catch (error) {
      setMessage('エラーが発生しました')
    } finally {
      setLoading(false)
    }
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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              新しい記事を投稿
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  タイトル *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  概要
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="記事の概要を入力してください"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  本文 *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Markdownで記事を書いてください"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Markdown記法を使用できます
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    カテゴリ
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    タグ
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="カンマ区切り例：家族,思い出,2025"
                  />
                  
                  {/* 選択されたタグを表示 */}
                  {selectedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* タグサジェスト */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">おすすめタグ（クリックで追加）</p>
                    <div className="flex flex-wrap gap-1">
                      {/* 過去に使用したタグを優先表示 */}
                      {usedTags.slice(0, 8).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-indigo-100 text-indigo-800 cursor-not-allowed opacity-50'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                          disabled={selectedTags.includes(tag)}
                        >
                          #{tag}
                        </button>
                      ))}
                      {/* サジェストタグ */}
                      {SUGGESTED_TAGS.filter(tag => !usedTags.includes(tag)).slice(0, 12).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-indigo-100 text-indigo-800 cursor-not-allowed opacity-50'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          disabled={selectedTags.includes(tag)}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="heroImageUrl" className="block text-sm font-medium text-gray-700">
                  アイキャッチ画像URL
                </label>
                <input
                  type="url"
                  id="heroImageUrl"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-md ${
                  message.includes('投稿しました') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !content.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '投稿中...' : '投稿する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}