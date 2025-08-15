'use client'

import { createContext, useContext } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { Session } from 'next-auth'

interface AuthContextType {
  user: Session['user'] | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user || null
  
  // P006対策: より詳細な認証状態追跡
  const isReady = status !== 'loading'

  const signOut = async () => {
    await nextAuthSignOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}