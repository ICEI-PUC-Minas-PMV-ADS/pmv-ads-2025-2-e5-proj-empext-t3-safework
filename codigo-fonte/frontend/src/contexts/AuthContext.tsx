'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiClient, User, LoginRequest } from '../lib/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          // Recupera dados do usuário do localStorage se existirem
          const savedUser = localStorage.getItem('user_data')
          if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        apiClient.logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await apiClient.login(credentials)
      apiClient.setToken(response.jwtToken)
      
      // Salva os dados do usuário no localStorage
      localStorage.setItem('user_data', JSON.stringify(response.usuario))
      setUser(response.usuario)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiClient.logout()
    localStorage.removeItem('user_data')
    setUser(null)
    setError(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
