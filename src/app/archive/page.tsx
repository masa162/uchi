'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface ArchiveData {
  yearMonth: string
  count: number
  year: number
  month: number
}

export default function ArchivePage() {
  const [archive, setArchive] = useState<ArchiveData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchArchive()
  }, [])

  const fetchArchive = async () => {
    try {
      const response = await fetch('/api/articles/archive')
      if (response.ok) {
        const data = await response.json()
        setArchive(data.archive || [])
      }
    } catch (error) {
      console.error('アーカイブの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: number) => {
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ]
    return monthNames[month - 1]
  }

  const handleArchiveClick = (yearMonth: string) => {
    router.push(`/archive/${yearMonth}`)
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">📂 月別アーカイブ</h1>
          <p className="text-gray-600">
            月ごとの記事をご覧いただけます（{archive.length}ヶ月分）
          </p>
        </div>

        {archive.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">まだ記事がありません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archive.map((item) => (
              <button
                key={item.yearMonth}
                onClick={() => handleArchiveClick(item.yearMonth)}
                className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.year}年 {getMonthName(item.month)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.count}件の記事
                    </p>
                  </div>
                  <div className="text-2xl">
                    📅
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (item.count / Math.max(...archive.map(a => a.count))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}