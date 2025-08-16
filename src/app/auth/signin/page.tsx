'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // 既にログインしている場合はホームページにリダイレクト
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
    
    // URLパラメータからメッセージを確認
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error) {
      setMessage('うまくログインできませんでした。もう一度お試しください 😊')
      setMessageType('error')
    } else if (message === 'check-email') {
      setMessage('ログインリンクをメールでお送りしました。メールボックスをのぞいてみてくださいね 📬')
      setMessageType('success')
    }
  }, [router, searchParams])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setMessage('')

    try {
      const result = await signIn('email', {
        email: email,
        redirect: false,
        callbackUrl: '/'
      })

      if (result?.ok) {
        setMessage('ログインリンクをメールでお送りしました。メールボックスをのぞいてみてくださいね 📬')
        setMessageType('success')
      } else {
        setMessage('うまく送れませんでした。少し待ってからもう一度お試しください 🙏')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Email sign-in error:', error);
      setMessage('何かうまくいかなかったようです。しばらく待ってからお試しください 😅')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Google sign-in error:', error);
      setMessage('Googleログインがうまくいきませんでした。もう一度お試しください 😊')
      setMessageType('error')
      setIsLoading(false)
    }
  }

  const handleLineSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('line', { callbackUrl: '/' })
    } catch (error) {
      console.error('LINE sign-in error:', error);
      setMessage('LINEログインがうまくいきませんでした。もう一度お試しください 😊')
      setMessageType('error')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-light">
            <span className="text-3xl">🏠</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            うちのきろく
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            家族のあたたかい思い出をつづる場所へ、おかえりなさい 🏠
          </p>
        </div>

        {message && (
          <div className={`rounded-md p-4 ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-red-400">✗</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm">{message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {/* LINEログインボタン（高齢者向けに一番上に配置） */}
          <div>
            <button
              onClick={handleLineSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out hover:scale-[102%]"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </span>
              LINEでログイン
            </button>
          </div>

          {/* Googleログインボタン */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out hover:scale-[102%]"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </span>
              Googleでログイン
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-base-200 text-gray-500">または</span>
            </div>
          </div>

          {/* メールログインフォーム */}
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="your-email@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
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
                    送信中...
                  </>
                ) : (
                  'ログインリンクを送信'
                )}
              </button>
            </div>
          </form>

          {/* パスワードを忘れた方向けリンク */}
          <div className="text-center mt-4">
            <Link 
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              🔐 あいことばを忘れてしまいましたか？
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              <strong>🌸 はじめての方へ</strong><br />
              LINEやGoogleでログインすると、やさしく自動でアカウントをつくります
            </p>
            <p className="text-xs">
              いつものアプリでログインできるので、<br />
              あいことばを覚えておく必要がありません 😊
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}