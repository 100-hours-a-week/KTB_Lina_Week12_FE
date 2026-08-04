import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearAccessToken,
  setAccessToken,
} from '../api/client.js'
import { getCurrentUser } from '../api/users.js'
import AuthContext from './AuthContext.js'

function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)

  const refreshUser = useCallback(async () => {
    setStatus('loading')

    try {
      const nextUser = await getCurrentUser()

      if (nextUser) {
        setUser(nextUser)
        setStatus('authenticated')
        return nextUser
      }

      clearAccessToken()
      setUser(null)
      setStatus('unauthenticated')
      return null
    } catch {
      clearAccessToken()
      setUser(null)
      setStatus('unauthenticated')
      return null
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null)
      setStatus('unauthenticated')
    }

    window.addEventListener('auth-expired', handleAuthExpired)
    return () => window.removeEventListener('auth-expired', handleAuthExpired)
  }, [])

  const signIn = useCallback(
    async (token) => {
      setAccessToken(token)
      return refreshUser()
    },
    [refreshUser],
  )

  const signOut = useCallback(() => {
    clearAccessToken()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo(
    () => ({
      status,
      user,
      refreshUser,
      signIn,
      signOut,
      updateUser: setUser,
    }),
    [refreshUser, signIn, signOut, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
