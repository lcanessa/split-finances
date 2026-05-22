import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchUsers } from '../services/usersService'
import { AppContext } from './AppContext'

const ACTIVE_USER_KEY = 'split-finances-active-user-id'

export function AppProvider({ children }) {
  const [users, setUsers] = useState([])
  const [activeUser, setActiveUserState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchUsers()
      setUsers(data)

      const savedId = localStorage.getItem(ACTIVE_USER_KEY)
      const savedUser = data.find((user) => user.id === savedId) ?? null
      setActiveUserState(savedUser)
    } catch (err) {
      setError(err.message ?? 'No se pudieron cargar los usuarios')
      setUsers([])
      setActiveUserState(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchUsers()
        if (cancelled) return

        setUsers(data)
        const savedId = localStorage.getItem(ACTIVE_USER_KEY)
        const savedUser = data.find((user) => user.id === savedId) ?? null
        setActiveUserState(savedUser)
      } catch (err) {
        if (cancelled) return
        setError(err.message ?? 'No se pudieron cargar los usuarios')
        setUsers([])
        setActiveUserState(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  const setActiveUser = useCallback((user) => {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, user.id)
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY)
    }
    setActiveUserState(user)
  }, [])

  const clearActiveUser = useCallback(() => {
    setActiveUser(null)
  }, [setActiveUser])

  const value = useMemo(
    () => ({
      users,
      activeUser,
      loading,
      error,
      setActiveUser,
      clearActiveUser,
      refreshUsers: loadUsers,
    }),
    [users, activeUser, loading, error, setActiveUser, clearActiveUser, loadUsers],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
