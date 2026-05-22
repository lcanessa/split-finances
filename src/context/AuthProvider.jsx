import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { signInWithEmail, signOut as signOutRequest, signUpWithEmail } from '../services/authService'
import { AuthContext } from './AuthContext'

const ACTIVE_USER_KEY = 'split-finances-active-user-id'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!cancelled) {
        setSession(data.session)
        setLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { session: newSession } = await signInWithEmail(email, password)
    setSession(newSession)
    return newSession
  }, [])

  const signUp = useCallback(async (email, password) => {
    return signUpWithEmail(email, password)
  }, [])

  const signOut = useCallback(async () => {
    await signOutRequest()
    localStorage.removeItem(ACTIVE_USER_KEY)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isAuthenticated: Boolean(session),
      signIn,
      signUp,
      signOut,
    }),
    [session, loading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
