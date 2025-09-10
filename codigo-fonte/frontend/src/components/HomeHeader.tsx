'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">
              SafeWork
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.nomeCompleto?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-700">
                {user?.nomeCompleto || 'Usuário'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>

          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a
                href="/home"
                className="text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Relatórios
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Configurações
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Suporte
              </a>
              <div className="border-t pt-2">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.nomeCompleto?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">
                    {user?.nomeCompleto || 'Usuário'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
