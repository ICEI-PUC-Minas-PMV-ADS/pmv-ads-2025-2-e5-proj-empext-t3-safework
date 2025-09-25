'use client'

import { useState, useEffect } from 'react'
import { Contrato, ContratoFormData, StatusContrato } from '../types/contrato'

interface ContratoFormProps {
  contrato?: Contrato | null
  onSave: (contrato: Contrato) => void
  onCancel: () => void
}

// Mock data para empresas - em produção viria de uma API
const mockEmpresas = [
  { id: 1, nome_razao: 'Empresa ABC Ltda', cpf_cnpj: '12.345.678/0001-90' },
  { id: 2, nome_razao: 'XYZ Serviços S.A.', cpf_cnpj: '98.765.432/0001-10' },
  { id: 3, nome_razao: 'Tech Solutions Ltda', cpf_cnpj: '11.222.333/0001-44' }
]

const mockEmpresasPrestadoras = [
  { id: 1, nome_razao: 'ScPrevenção', cpf_cnpj: '99.999.999/0001-99' },
  { id: 2, nome_razao: 'SafeWork Consultoria', cpf_cnpj: '88.888.888/0001-88' }
]

export function ContratoForm({ contrato, onSave, onCancel }: ContratoFormProps) {
  const [formData, setFormData] = useState<ContratoFormData>({
    numero: '',
    data_inicio: '',
    data_fim: '',
    status_contrato: StatusContrato.Ativo,
    path_file: '',
    valor: '',
    observacoes: '',
    id_empresa_cliente: 0,
    id_empresa_prestadora: 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (contrato) {
      setFormData({
        numero: contrato.numero,
        data_inicio: contrato.data_inicio.split('T')[0], // Formato para input date
        data_fim: contrato.data_fim.split('T')[0],
        status_contrato: contrato.status_contrato,
        path_file: contrato.path_file || '',
        valor: contrato.valor.toString(),
        observacoes: contrato.observacoes || '',
        id_empresa_cliente: contrato.id_empresa_cliente,
        id_empresa_prestadora: contrato.id_empresa_prestadora
      })
    }
  }, [contrato])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Converte para formato de moeda
    const amount = parseFloat(numbers) / 100
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatCurrency(value)
    
    setFormData(prev => ({
      ...prev,
      valor: formatted
    }))

    if (errors.valor) {
      setErrors(prev => ({
        ...prev,
        valor: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.numero.trim()) {
      newErrors.numero = 'Número do contrato é obrigatório'
    }

    if (!formData.data_inicio) {
      newErrors.data_inicio = 'Data de início é obrigatória'
    }

    if (!formData.data_fim) {
      newErrors.data_fim = 'Data de fim é obrigatória'
    }

    if (formData.data_inicio && formData.data_fim) {
      const dataInicio = new Date(formData.data_inicio)
      const dataFim = new Date(formData.data_fim)
      
      if (dataFim <= dataInicio) {
        newErrors.data_fim = 'Data de fim deve ser posterior à data de início'
      }
    }

    if (!formData.valor.trim()) {
      newErrors.valor = 'Valor do contrato é obrigatório'
    }

    if (formData.id_empresa_cliente === 0) {
      newErrors.id_empresa_cliente = 'Empresa cliente é obrigatória'
    }

    if (formData.id_empresa_prestadora === 0) {
      newErrors.id_empresa_prestadora = 'Empresa prestadora é obrigatória'
    }

    if (formData.id_empresa_cliente === formData.id_empresa_prestadora && formData.id_empresa_cliente !== 0) {
      newErrors.id_empresa_prestadora = 'Empresa prestadora deve ser diferente da empresa cliente'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Converter valor de string formatada para número
    const valorNumerico = parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.'))

    const dataToSave: Contrato = {
      id: contrato?.id,
      numero: formData.numero,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      status_contrato: formData.status_contrato,
      path_file: formData.path_file || undefined,
      valor: valorNumerico,
      observacoes: formData.observacoes || undefined,
      id_empresa_cliente: formData.id_empresa_cliente,
      id_empresa_prestadora: formData.id_empresa_prestadora
    }

    onSave(dataToSave)
  }

  const getStatusLabel = (status: StatusContrato) => {
    switch (status) {
      case StatusContrato.Ativo:
        return 'Ativo'
      case StatusContrato.Inativo:
        return 'Inativo'
      case StatusContrato.Suspenso:
        return 'Suspenso'
      default:
        return 'Ativo'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {contrato ? 'Editar Contrato' : 'Novo Contrato'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Número do Contrato */}
          <div>
            <label htmlFor="numero" className="block text-sm font-medium text-gray-900 mb-2">
              Número do Contrato *
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
              placeholder="Digite o número do contrato"
            />
            {errors.numero && (
              <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
            )}
          </div>

          {/* Status do Contrato */}
          <div>
            <label htmlFor="status_contrato" className="block text-sm font-medium text-gray-900 mb-2">
              Status *
            </label>
            <select
              id="status_contrato"
              name="status_contrato"
              value={formData.status_contrato}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value={StatusContrato.Ativo}>{getStatusLabel(StatusContrato.Ativo)}</option>
              <option value={StatusContrato.Inativo}>{getStatusLabel(StatusContrato.Inativo)}</option>
              <option value={StatusContrato.Suspenso}>{getStatusLabel(StatusContrato.Suspenso)}</option>
            </select>
          </div>

          {/* Data de Início */}
          <div>
            <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-900 mb-2">
              Data de Início *
            </label>
            <input
              type="date"
              id="data_inicio"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.data_inicio ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.data_inicio && (
              <p className="mt-1 text-sm text-red-600">{errors.data_inicio}</p>
            )}
          </div>

          {/* Data de Fim */}
          <div>
            <label htmlFor="data_fim" className="block text-sm font-medium text-gray-900 mb-2">
              Data de Fim *
            </label>
            <input
              type="date"
              id="data_fim"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.data_fim ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.data_fim && (
              <p className="mt-1 text-sm text-red-600">{errors.data_fim}</p>
            )}
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-900 mb-2">
              Valor do Contrato *
            </label>
            <input
              type="text"
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={handleValorChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.valor ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="R$ 0,00"
            />
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
            )}
          </div>

          {/* Arquivo */}
          <div>
            <label htmlFor="path_file" className="block text-sm font-medium text-gray-900 mb-2">
              Arquivo do Contrato
            </label>
            <input
              type="text"
              id="path_file"
              name="path_file"
              value={formData.path_file}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="Caminho do arquivo (opcional)"
            />
          </div>

          {/* Empresa Cliente */}
          <div>
            <label htmlFor="id_empresa_cliente" className="block text-sm font-medium text-gray-900 mb-2">
              Empresa Cliente *
            </label>
            <select
              id="id_empresa_cliente"
              name="id_empresa_cliente"
              value={formData.id_empresa_cliente}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.id_empresa_cliente ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value={0}>Selecione uma empresa cliente</option>
              {mockEmpresas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome_razao} - {empresa.cpf_cnpj}
                </option>
              ))}
            </select>
            {errors.id_empresa_cliente && (
              <p className="mt-1 text-sm text-red-600">{errors.id_empresa_cliente}</p>
            )}
          </div>

          {/* Empresa Prestadora */}
          <div>
            <label htmlFor="id_empresa_prestadora" className="block text-sm font-medium text-gray-900 mb-2">
              Empresa Prestadora *
            </label>
            <select
              id="id_empresa_prestadora"
              name="id_empresa_prestadora"
              value={formData.id_empresa_prestadora}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.id_empresa_prestadora ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value={0}>Selecione uma empresa prestadora</option>
              {mockEmpresasPrestadoras.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome_razao} - {empresa.cpf_cnpj}
                </option>
              ))}
            </select>
            {errors.id_empresa_prestadora && (
              <p className="mt-1 text-sm text-red-600">{errors.id_empresa_prestadora}</p>
            )}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-900 mb-2">
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
            placeholder="Digite observações sobre o contrato (opcional)"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6">
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
            {contrato ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}