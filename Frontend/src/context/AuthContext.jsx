import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data.user)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
    }
    setUser(res.data.user)
    return res.data
  }

  const register = async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password })
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
    }
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    try {
      await api.get('/api/auth/logout')
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
