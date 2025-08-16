'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: '認証設定エラー',
          description: 'LINE認証の設定に問題があります。管理者にお問い合わせください。',
          details: 'NextAuth.js設定またはLINE Developer設定を確認してください。'
        }
      case 'AccessDenied':
        return {
          title: 'アクセス拒否',
          description: 'ログインが拒否されました。',
          details: 'アカウントの権限またはLINE認証の設定を確認してください。'
        }
      case 'Verification':
        return {
          title: '認証エラー',
          description: '認証プロセスで問題が発生しました。',
          details: 'LINE認証のコールバック処理に問題がある可能性があります。'
        }
      case 'Default':
      default:
        return {
          title: 'ログインエラー',
          description: 'ログイン中に予期しないエラーが発生しました。',
          details: error ? `エラーコード: ${error}` : 'しばらく時間をおいて再度お試しください。'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          {/* エラーアイコン */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* エラー情報 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h1>
            <p className="text-gray-600 mb-4">
              {errorInfo.description}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              {errorInfo.details}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full btn btn-primary"
            >
              ログインページに戻る
            </Link>
            
            <Link
              href="/"
              className="w-full btn btn-ghost"
            >
              ホームページに戻る
            </Link>
            
            {/* デバッグ用 */}
            {process.env.NODE_ENV === 'development' && (
              <Link
                href="/auth/line-debug"
                className="w-full btn btn-warning text-white"
              >
                LINE認証デバッグページ
              </Link>
            )}
          </div>

          {/* デバッグ情報 */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">デバッグ情報:</h3>
              <p className="text-red-700 text-sm font-mono">
                Error Type: {error}
              </p>
              <p className="text-red-700 text-sm">
                URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}