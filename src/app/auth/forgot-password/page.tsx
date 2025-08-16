'use client'

import { useState } from 'react'

import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | ''>('')
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      setMessage(data.message)
      setMessageType(data.type || 'success')

      if (response.ok) {
        setEmail('')
      }
    } catch (error) {
      console.error('パスワードリセットリクエスト中にエラーが発生しました:', error);
      setMessage('すみません、何かうまくいかなかったようです。しばらく待ってからもう一度お試しください 🙏')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-accent-yellow">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            あいことばを忘れてしまいましたか？
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            大丈夫です。新しいあいことばをお送りしますね 💝
          </p>
        </div>

        {message && (
          <div className={`rounded-lg p-4 ${
            messageType === 'success' 
              ? 'bg-primary-light border border-primary text-primary-dark' 
              : messageType === 'info'
              ? 'bg-accent-yellow border border-accent-brown text-accent-brown'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <span className="text-2xl">📧</span>
                ) : messageType === 'info' ? (
                  <span className="text-2xl">💡</span>
                ) : (
                  <span className="text-2xl">😅</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="bg-base-100 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-medium text-primary-dark mb-4">
              📮 メールで新しいあいことばをお送りします
            </h3>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="your-email@example.com"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out hover:scale-[102%]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    お送りしています...
                  </>
                ) : (
                  '💌 新しいあいことばを送る'
                )}
              </button>
            </form>
          </div>

          <div className="bg-primary-light p-4 rounded-lg">
            <h4 className="text-sm font-medium text-primary-dark mb-2">💡 こんな方法もあります</h4>
            <ul className="text-xs text-primary-dark space-y-1">
              <li>• LINEログインなら、パスワードを覚える必要がありません</li>
              <li>• Googleアカウントでも簡単にログインできます</li>
              <li>• ご家族の方に手伝ってもらうのもおすすめです</li>
            </ul>
          </div>

          <div className="text-center space-y-2">
            <Link 
              href="/auth/signin"
              className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
            >
              🏠 ログインページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}