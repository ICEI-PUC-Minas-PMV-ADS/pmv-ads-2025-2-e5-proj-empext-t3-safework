'use client'

import { useState, useEffect } from 'react'
import { EnderecoFormData, ESTADOS_BRASILEIROS } from '../types/endereco'

export interface Endereco {
  id?: number
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  municipio: string
  uf: string
  cep: string
}

interface EnderecoFormProps {
  endereco?: Endereco | null
  onSave: (endereco: EnderecoFormData) => void
  onCancel: () => void
}

export function EnderecoForm({ endereco, onSave, onCancel }: EnderecoFormProps) {
  const [formData, setFormData] = useState<EnderecoFormData>({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    cep: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  useEffect(() => {
    if (endereco) {
      setFormData({
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento || '',
        bairro: endereco.bairro,
        municipio: endereco.municipio,
        uf: endereco.uf,
        cep: endereco.cep
      })
    }
  }, [endereco])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const formatCep = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara 00000-000
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    
    return numbers.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedCep = formatCep(value)
    
    setFormData(prev => ({
      ...prev,
      cep: formattedCep
    }))

    // Limpar erro do CEP
    if (errors.cep) {
      setErrors(prev => ({
        ...prev,
        cep: ''
      }))
    }

    // Buscar endereço pelo CEP quando tiver 8 dígitos
    const cleanCep = formattedCep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      setIsLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            municipio: data.localidade || prev.municipio,
            uf: data.uf || prev.uf
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      } finally {
        setIsLoadingCep(false)
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.logradouro.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório'
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório'
    }

    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório'
    }

    if (!formData.municipio.trim()) {
      newErrors.municipio = 'Município é obrigatório'
    }

    if (!formData.uf.trim()) {
      newErrors.uf = 'UF é obrigatório'
    }

    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório'
    } else if (formData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP deve ter 8 dígitos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Remove formatação do CEP antes de enviar
    const dataToSave = {
      ...formData,
      cep: formData.cep.replace(/\D/g, '')
    }

    onSave(dataToSave)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {endereco ? 'Editar Endereço' : 'Novo Endereço'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CEP */}
          <div>
            <label htmlFor="cep" className="block text-sm font-medium text-gray-900 mb-2">
              CEP *
            </label>
            <div className="relative">
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleCepChange}
                maxLength={9}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                  errors.cep ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="00000-000"
              />
              {isLoadingCep && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {errors.cep && (
              <p className="mt-1 text-sm text-red-600">{errors.cep}</p>
            )}
          </div>

          {/* UF */}
          <div>
            <label htmlFor="uf" className="block text-sm font-medium text-gray-900 mb-2">
              Estado (UF) *
            </label>
            <select
              id="uf"
              name="uf"
              value={formData.uf}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.uf ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione o estado</option>
              {ESTADOS_BRASILEIROS.map(estado => (
                <option key={estado.sigla} value={estado.sigla}>
                  {estado.nome} ({estado.sigla})
                </option>
              ))}
            </select>
            {errors.uf && (
              <p className="mt-1 text-sm text-red-600">{errors.uf}</p>
            )}
          </div>

          {/* Município */}
          <div>
            <label htmlFor="municipio" className="block text-sm font-medium text-gray-900 mb-2">
              Município *
            </label>
            <input
              type="text"
              id="municipio"
              name="municipio"
              value={formData.municipio}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.municipio ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite o município"
            />
            {errors.municipio && (
              <p className="mt-1 text-sm text-red-600">{errors.municipio}</p>
            )}
          </div>

          {/* Bairro */}
          <div>
            <label htmlFor="bairro" className="block text-sm font-medium text-gray-900 mb-2">
              Bairro *
            </label>
            <input
              type="text"
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.bairro ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite o bairro"
            />
            {errors.bairro && (
              <p className="mt-1 text-sm text-red-600">{errors.bairro}</p>
            )}
          </div>

          {/* Logradouro */}
          <div className="md:col-span-2">
            <label htmlFor="logradouro" className="block text-sm font-medium text-gray-900 mb-2">
              Logradouro *
            </label>
            <input
              type="text"
              id="logradouro"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.logradouro ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite o logradouro (rua, avenida, etc.)"
            />
            {errors.logradouro && (
              <p className="mt-1 text-sm text-red-600">{errors.logradouro}</p>
            )}
          </div>

          {/* Número */}
          <div>
            <label htmlFor="numero" className="block text-sm font-medium text-gray-900 mb-2">
              Número *
            </label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.numero ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite o número"
            />
            {errors.numero && (
              <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
            )}
          </div>

          {/* Complemento */}
          <div>
            <label htmlFor="complemento" className="block text-sm font-medium text-gray-900 mb-2">
              Complemento
            </label>
            <input
              type="text"
              id="complemento"
              name="complemento"
              value={formData.complemento}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="Apartamento, sala, bloco, etc."
            />
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
            {endereco ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}