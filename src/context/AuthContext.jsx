import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ambulance_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      }
    } catch (e) {
      localStorage.removeItem('ambulance_user')
      localStorage.removeItem('ambulance_token')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('ambulance_user', JSON.stringify(userData))
    localStorage.setItem('ambulance_token', userData.token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ambulance_user')
    localStorage.removeItem('ambulance_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
