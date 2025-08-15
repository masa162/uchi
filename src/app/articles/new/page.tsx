'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import MarkdownPreview from '@/components/MarkdownPreview'

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
  const [showPreview, setShowPreview] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const { user } = useAuth()
  const router = useRouter()

  // 過去に使用されたタグを取得と下書き読み込み
  useEffect(() => {
    fetchUsedTags()
    loadDraft()
  }, [])

  // 自動下書き保存
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.trim() || content.trim()) {
        saveDraft()
      }
    }, 2000) // 2秒後に保存

    return () => clearTimeout(timer)
  }, [title, content, description, category, tags, heroImageUrl]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // 下書き保存
  const saveDraft = async () => {
    if (draftSaving) return
    
    setDraftSaving(true)
    try {
      const draftData = {
        title,
        content,
        description,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        heroImageUrl: heroImageUrl || null
      }

      // LocalStorageに保存
      localStorage.setItem('article_draft', JSON.stringify({
        ...draftData,
        savedAt: new Date().toISOString()
      }))

      setLastSaved(new Date())
    } catch (error) {
      console.log('下書き保存に失敗しました')
    } finally {
      setDraftSaving(false)
    }
  }

  // 下書き読み込み
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('article_draft')
      if (savedDraft) {
        const draft = JSON.parse(savedDraft)
        setTitle(draft.title || '')
        setContent(draft.content || '')
        setDescription(draft.description || '')
        setCategory(draft.category || '')
        const draftTags = Array.isArray(draft.tags) ? draft.tags.join(', ') : ''
        setTags(draftTags)
        setSelectedTags(Array.isArray(draft.tags) ? draft.tags : [])
        setHeroImageUrl(draft.heroImageUrl || '')
        
        if (draft.savedAt) {
          setLastSaved(new Date(draft.savedAt))
        }
      }
    } catch (error) {
      console.log('下書きの読み込みに失敗しました')
    }
  }

  // 下書き削除
  const clearDraft = () => {
    localStorage.removeItem('article_draft')
    setLastSaved(null)
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
        clearDraft() // 投稿成功時に下書きを削除
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
      {/* モバイル最適化ナビゲーション */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
            >
              うちのきろく
            </button>
            <div className="flex items-center space-x-2 sm:space-x-4">
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

      {/* モバイル最適化メインコンテンツ */}
      <main className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
          {/* メイン投稿フォーム */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
          {/* ヘッダー */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              ✍️ 詳細記事を投稿
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <p className="text-gray-600 text-sm mb-2 sm:mb-0">
                タイトル、カテゴリ、タグなど詳細設定が可能です
              </p>
              {/* 下書き保存状態 */}
              <div className="flex items-center space-x-2 text-xs">
                {draftSaving && (
                  <span className="text-blue-600 flex items-center">
                    <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-1"></div>
                    保存中...
                  </span>
                )}
                {lastSaved && !draftSaving && (
                  <span className="text-green-600">
                    ✓ {lastSaved.toLocaleTimeString()}に保存済み
                  </span>
                )}
                {!lastSaved && !draftSaving && (
                  <span className="text-gray-500">
                    💾 自動保存有効
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 投稿フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base touch-manipulation"
                placeholder="記事のタイトルを入力してください"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                概要
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none touch-manipulation"
                placeholder="記事の概要を入力してください（任意）"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                本文 *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="block w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base leading-relaxed resize-none touch-manipulation min-h-[200px] sm:min-h-[300px]"
                placeholder="記事の本文を書いてください&#10;&#10;Markdown記法が使用できます：&#10;・**太字** *斜体*&#10;・# 見出し&#10;・- リスト項目"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                📝 Markdown記法対応 | 🎨 プレビュー機能（準備中）
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base touch-manipulation"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  タグ
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="block w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base touch-manipulation"
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

                {/* タグサジェスト - モバイル最適化 */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">💡 おすすめタグ（タップで追加）</p>
                  <div className="flex flex-wrap gap-2">
                    {/* 過去に使用したタグを優先表示 */}
                    {usedTags.slice(0, 6).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className={`px-3 py-2 text-sm rounded-full transition-colors touch-manipulation min-h-[36px] ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-100 text-blue-800 cursor-not-allowed opacity-50'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300'
                        }`}
                        disabled={selectedTags.includes(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                    {/* サジェストタグ */}
                    {SUGGESTED_TAGS.filter(tag => !usedTags.includes(tag)).slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className={`px-3 py-2 text-sm rounded-full transition-colors touch-manipulation min-h-[36px] ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-100 text-blue-800 cursor-not-allowed opacity-50'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
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
              <label htmlFor="heroImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                🖼️ アイキャッチ画像URL
              </label>
              <input
                type="url"
                id="heroImageUrl"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="block w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base touch-manipulation"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                画像URLを貼り付けてください（任意）
              </p>
            </div>

            {/* メッセージ表示 */}
            {message && (
              <div className={`p-4 rounded-lg text-sm sm:text-base ${
                message.includes('投稿しました') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* ボタンエリア - モバイル最適化 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4">
              <div className="flex flex-col sm:flex-row gap-3 order-2 sm:order-1">
                <button
                  type="button"
                  onClick={() => router.push('/articles')}
                  className="px-6 py-4 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation min-h-[48px]"
                  disabled={loading}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveDraft()
                    router.push('/articles/simple')
                  }}
                  className="px-6 py-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm touch-manipulation min-h-[48px]"
                  disabled={loading}
                >
                  簡易モード
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="px-4 py-4 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm touch-manipulation min-h-[48px]"
                  disabled={loading || !lastSaved}
                >
                  🗑️ 下書き削除
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-6 py-4 sm:py-2 rounded-lg transition-colors touch-manipulation min-h-[48px] ${
                    showPreview 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showPreview ? '📝 編集モード' : '👁️ プレビュー'}
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !content.trim()}
                  className={`px-8 py-4 sm:py-2 rounded-lg font-medium text-lg sm:text-base transition-all duration-200 touch-manipulation min-h-[48px] ${
                    loading || !title.trim() || !content.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      投稿中...
                    </span>
                  ) : (
                    '📝 投稿する'
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {/* 使い方のヒント */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使い方のヒント</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Markdown記法で文章装飾ができます</li>
              <li>• プレビューで実際の表示を確認できます</li>
              <li>• 自動下書き保存で安心して執筆できます</li>
              <li>• タグは検索やカテゴリ分けに活用されます</li>
              <li>• 簡易モードでサクッと投稿も可能です</li>
            </ul>
          </div>
        </div>
        
        {/* プレビューパネル */}
        {showPreview && (
          <div className="bg-white rounded-lg shadow-sm">
            <MarkdownPreview 
              title={title}
              description={description}
              content={content}
              className="p-4 sm:p-8"
            />
          </div>
        )}
      </div>
      </main>
    </div>
  )
}