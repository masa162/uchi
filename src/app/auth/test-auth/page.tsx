'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<{[key: string]: 'success' | 'error' | 'pending'}>({})

  const testAuthProvider = async (provider: string) => {
    setTestResults(prev => ({ ...prev, [provider]: 'pending' }))
    
    try {
      // 実際の環境変数をチェック
      const response = await fetch('/api/auth/test-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      })
      
      const result = await response.json()
      setTestResults(prev => ({ 
        ...prev, 
        [provider]: result.configured ? 'success' : 'error' 
      }))
    } catch (error) {
      console.error(`Error testing provider ${provider}:`, error);
      setTestResults(prev => ({ ...prev, [provider]: 'error' }))
    }
  }

  const getStatusIcon = (status: 'success' | 'error' | 'pending' | undefined) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌' 
      case 'pending': return '⏳'
      default: return '⚪'
    }
  }

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-light">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
            認証設定テスト
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            OAuth設定の状況を確認します 🏠
          </p>
        </div>

        <div className="bg-base-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-primary-dark mb-6">
            🔐 認証プロバイダー設定状況
          </h2>
          
          <div className="space-y-4">
            {/* Google OAuth */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div>
                  <h3 className="font-medium">Google OAuth</h3>
                  <p className="text-sm text-gray-500">GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getStatusIcon(testResults.google)}</span>
                <button
                  onClick={() => testAuthProvider('google')}
                  className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                  確認
                </button>
              </div>
            </div>

            {/* LINE Login */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <div>
                  <h3 className="font-medium">LINE Login</h3>
                  <p className="text-sm text-gray-500">LINE_CHANNEL_ID / LINE_CHANNEL_SECRET</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getStatusIcon(testResults.line)}</span>
                <button
                  onClick={() => testAuthProvider('line')}
                  className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                  確認
                </button>
              </div>
            </div>

            {/* Email SMTP */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📧</span>
                <div>
                  <h3 className="font-medium">メール認証 (SMTP)</h3>
                  <p className="text-sm text-gray-500">EMAIL_SERVER_* 設定</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getStatusIcon(testResults.email)}</span>
                <button
                  onClick={() => testAuthProvider('email')}
                  className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                  確認
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent-yellow rounded-lg">
            <h3 className="font-medium text-accent-brown mb-2">💡 設定方法</h3>
            <p className="text-sm text-accent-brown">
              詳しい設定手順は <code>docs/仕様書/OAuth設定手順.md</code> をご確認ください。
            </p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <Link 
            href="/auth/signin"
            className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors mr-4"
          >
            🏠 ログインページに戻る
          </Link>
          <Link 
            href="/"
            className="inline-block px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            メインページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}