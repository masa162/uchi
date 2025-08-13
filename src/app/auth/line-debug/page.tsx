'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'

export default function LineDebugPage() {
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()

  const testLineLogin = async () => {
    setIsLoading(true)
    setDebugInfo('LINE Login開始...')
    
    try {
      const result = await signIn('line', { 
        callbackUrl: '/auth/line-debug',
        redirect: false 
      })
      
      if (result?.error) {
        setDebugInfo(`LINE Login エラー: ${result.error}`)
      } else if (result?.url) {
        setDebugInfo(`LINE認証画面にリダイレクト: ${result.url}`)
        window.location.href = result.url
      } else {
        setDebugInfo('LINE Login成功')
      }
    } catch (error) {
      setDebugInfo(`予期しないエラー: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkEnvironmentVars = async () => {
    try {
      const response = await fetch('/api/auth/test-config')
      const data = await response.json()
      setDebugInfo(JSON.stringify(data, null, 2))
    } catch (error) {
      setDebugInfo(`環境変数チェックエラー: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            LINE Login デバッグページ
          </h1>

          {/* セッション情報 */}
          <div className="mb-6 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-2">現在のセッション</h2>
            <p><strong>ステータス:</strong> {status}</p>
            {session ? (
              <div>
                <p><strong>ユーザー:</strong> {session.user?.name}</p>
                <p><strong>メール:</strong> {session.user?.email}</p>
                <p><strong>画像:</strong> {session.user?.image}</p>
              </div>
            ) : (
              <p>ログインしていません</p>
            )}
          </div>

          {/* アクションボタン */}
          <div className="space-y-4 mb-6">
            <button
              onClick={testLineLogin}
              disabled={isLoading}
              className="w-full btn btn-success text-white"
            >
              {isLoading ? 'ログイン中...' : 'LINE Login テスト'}
            </button>

            <button
              onClick={checkEnvironmentVars}
              className="w-full btn btn-info text-white"
            >
              環境変数チェック
            </button>
          </div>

          {/* デバッグ情報表示 */}
          {debugInfo && (
            <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap">
              <h3 className="text-white font-bold mb-2">デバッグ情報:</h3>
              {debugInfo}
            </div>
          )}

          {/* URLパラメータ表示 */}
          <div className="mt-6 p-4 bg-yellow-50 rounded">
            <h3 className="font-semibold mb-2">現在のURL情報:</h3>
            <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><strong>Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
            <p><strong>Search:</strong> {typeof window !== 'undefined' ? window.location.search : 'N/A'}</p>
          </div>

          {/* 説明 */}
          <div className="mt-6 text-sm text-gray-600">
            <h3 className="font-semibold mb-2">このページの使い方:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>「LINE Login テスト」でLINE認証をテスト</li>
              <li>「環境変数チェック」でLINE設定を確認</li>
              <li>デバッグ情報でエラーの詳細を確認</li>
              <li>ブラウザの開発者ツールでコンソールログも確認してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}