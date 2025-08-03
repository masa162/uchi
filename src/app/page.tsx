'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PasswordGate from '@/components/PasswordGate'
import AuthForm from '@/components/AuthForm'

export default function Home() {
  const [hasPassword, setHasPassword] = useState(false)
  const { user, loading, signOut } = useAuth()

  if (!hasPassword) {
    return <PasswordGate onSuccess={() => setHasPassword(true)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">うちのきろく</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                こんにちは、{user.email}さん
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              うちのきろくへようこそ
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              家族の思い出をアーカイブしていきましょう
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => window.location.href = '/articles'}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-left border-2 border-transparent hover:border-blue-200"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">📚</span>
                  <h3 className="text-xl font-semibold text-gray-800">記事一覧</h3>
                </div>
                <p className="text-gray-600">投稿された記事を見る</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/articles/new'}
                className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-left border-2 border-indigo-200 hover:border-indigo-300"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">✍️</span>
                  <h3 className="text-xl font-semibold text-indigo-800">新しい記事</h3>
                </div>
                <p className="text-indigo-600">新しい記事を投稿する</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/profile'}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-left border-2 border-transparent hover:border-green-200"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">👤</span>
                  <h3 className="text-xl font-semibold text-gray-800">プロフィール</h3>
                </div>
                <p className="text-gray-600">あなたのプロフィールを設定</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
