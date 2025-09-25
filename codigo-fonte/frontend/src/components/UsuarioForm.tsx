'use client'

import { useState, useEffect } from 'react'

export interface Usuario {
  id?: number
  nome_completo: string
  email: string
  senha: string
  id_empresa_prestadora?: number
  id_perfil: number
  status: boolean
}

interface UsuarioFormProps {
  usuario?: Usuario | null
  onSave: (usuario: Usuario) => void
  onCancel: () => void
}

export function UsuarioForm({ usuario, onSave, onCancel }: UsuarioFormProps) {
  const [formData, setFormData] = useState<Usuario>({
    nome_completo: '',
    email: '',
    senha: '',
    id_empresa_prestadora: undefined,
    id_perfil: 2 // Padrão: Administrador
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (usuario) {
      setFormData({
        ...usuario,
        senha: '' // Não preencher senha ao editar
      })
    }
  }, [usuario])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseInt(value) || 0
        : value
    }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo = 'Nome completo é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    if (!usuario && !formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.id_perfil) {
      newErrors.id_perfil = 'Perfil é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSave(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {usuario ? 'Editar Usuário' : 'Novo Usuário'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome Completo */}
          <div className="md:col-span-2">
            <label htmlFor="nome_completo" className="block text-sm font-medium text-gray-900 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="nome_completo"
              name="nome_completo"
              value={formData.nome_completo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="Digite o nome completo"
            />
            {errors.nome_completo && (
              <p className="mt-1 text-sm text-red-600">{errors.nome_completo}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="Digite o email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Perfil */}
          <div>
            <label htmlFor="id_perfil" className="block text-sm font-medium text-gray-900 mb-2">
              Perfil *
            </label>
            <select
              id="id_perfil"
              name="id_perfil"
              value={formData.id_perfil}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Selecione um perfil</option>
              <option value={2}>Administrador</option>
              <option value={3}>Usuário</option>
            </select>
            {errors.id_perfil && (
              <p className="mt-1 text-sm text-red-600">{errors.id_perfil}</p>
            )}
          </div>

          {/* Senha */}
          <div className="md:col-span-2">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-900 mb-2">
              {usuario ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                placeholder={usuario ? "Digite a nova senha" : "Digite a senha"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.senha && (
              <p className="mt-1 text-sm text-red-600">{errors.senha}</p>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {usuario ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}