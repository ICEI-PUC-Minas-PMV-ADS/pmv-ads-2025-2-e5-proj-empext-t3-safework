'use client'

import { useState, useEffect } from 'react'

export interface Empresa {
  id?: number
  tipo_pessoa: number
  cpf_cnpj: string
  nome_razao: string
  nome_fantasia?: string
  telefone?: string
  celular?: string
  email?: string
  status: boolean
  id_endereco?: number
}

interface EmpresaFormProps {
  empresa?: Empresa | null
  onSave: (empresa: Empresa) => void
  onCancel: () => void
}

export function EmpresaForm({ empresa, onSave, onCancel }: EmpresaFormProps) {
  const [formData, setFormData] = useState<Empresa>({
    tipo_pessoa: 1,
    cpf_cnpj: '',
    nome_razao: '',
    nome_fantasia: '',
    telefone: '',
    celular: '',
    email: '',
    status: true,
    id_endereco: undefined
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (empresa) {
      setFormData(empresa)
    }
  }, [empresa])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
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

  const formatCpfCnpj = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 11) {
      // Formato CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value)
    setFormData(prev => ({
      ...prev,
      cpf_cnpj: formatted
    }))

    if (errors.cpf_cnpj) {
      setErrors(prev => ({
        ...prev,
        cpf_cnpj: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cpf_cnpj.trim()) {
      newErrors.cpf_cnpj = 'CPF/CNPJ é obrigatório'
    }

    if (!formData.nome_razao.trim()) {
      newErrors.nome_razao = 'Nome/Razão Social é obrigatório'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Remove formatação do CPF/CNPJ antes de enviar
    const dataToSave = {
      ...formData,
      cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, '')
    }

    onSave(dataToSave)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {empresa ? 'Editar Empresa' : 'Nova Empresa'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Pessoa */}
          <div>
            <label htmlFor="tipo_pessoa" className="block text-sm font-medium text-gray-900 mb-2">
              Tipo de Pessoa *
            </label>
            <select
              id="tipo_pessoa"
              name="tipo_pessoa"
              value={formData.tipo_pessoa}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value={1}>Pessoa Física</option>
              <option value={2}>Pessoa Jurídica</option>
            </select>
          </div>

          {/* CPF/CNPJ */}
          <div>
            <label htmlFor="cpf_cnpj" className="block text-sm font-medium text-gray-900 mb-2">
              {formData.tipo_pessoa === 1 ? 'CPF' : 'CNPJ'} *
            </label>
            <input
              type="text"
              id="cpf_cnpj"
              name="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={handleCpfCnpjChange}
              maxLength={formData.tipo_pessoa === 1 ? 14 : 18}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.cpf_cnpj ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={formData.tipo_pessoa === 1 ? '000.000.000-00' : '00.000.000/0000-00'}
            />
            {errors.cpf_cnpj && (
              <p className="mt-1 text-sm text-red-600">{errors.cpf_cnpj}</p>
            )}
          </div>

          {/* Nome/Razão Social */}
          <div>
            <label htmlFor="nome_razao" className="block text-sm font-medium text-gray-900 mb-2">
              {formData.tipo_pessoa === 1 ? 'Nome Completo' : 'Razão Social'} *
            </label>
            <input
              type="text"
              id="nome_razao"
              name="nome_razao"
              value={formData.nome_razao}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.nome_razao ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={formData.tipo_pessoa === 1 ? 'Digite o nome completo' : 'Digite a razão social'}
            />
            {errors.nome_razao && (
              <p className="mt-1 text-sm text-red-600">{errors.nome_razao}</p>
            )}
          </div>

          {/* Nome Fantasia */}
          <div>
            <label htmlFor="nome_fantasia" className="block text-sm font-medium text-gray-900 mb-2">
              Nome Fantasia
            </label>
            <input
              type="text"
              id="nome_fantasia"
              name="nome_fantasia"
              value={formData.nome_fantasia || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="Digite o nome fantasia"
            />
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-900 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="(00) 0000-0000"
            />
          </div>

          {/* Celular */}
          <div>
            <label htmlFor="celular" className="block text-sm font-medium text-gray-900 mb-2">
              Celular
            </label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="exemplo@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={formData.status}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
              Empresa ativa
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {empresa ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}