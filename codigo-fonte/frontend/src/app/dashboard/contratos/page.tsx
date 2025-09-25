'use client'

import { useState, useEffect } from 'react'
import { ContratoForm } from '../../../components/ContratoForm'
import { Contrato, StatusContrato } from '../../../types/contrato'

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([
    {
      id: 1,
      numero: 'CT-2025-001',
      data_inicio: '2025-01-01T00:00:00Z',
      data_fim: '2025-12-31T23:59:59Z',
      status_contrato: StatusContrato.Ativo,
      path_file: '/contratos/ct-2025-001.pdf',
      valor: 150000.00,
      observacoes: 'Contrato de prestação de serviços de segurança do trabalho para o ano de 2025',
      id_empresa_cliente: 1,
      id_empresa_prestadora: 1,
      empresa_cliente: {
        id: 1,
        nome_razao: 'Empresa ABC Ltda',
        cpf_cnpj: '12.345.678/0001-90'
      },
      empresa_prestadora: {
        id: 1,
        nome_razao: 'ScPrevenção',
        cpf_cnpj: '99.999.999/0001-99'
      }
    },
    {
      id: 2,
      numero: 'CT-2025-002',
      data_inicio: '2025-02-01T00:00:00Z',
      data_fim: '2026-01-31T23:59:59Z',
      status_contrato: StatusContrato.Ativo,
      path_file: '/contratos/ct-2025-002.pdf',
      valor: 85000.00,
      observacoes: 'Contrato de consultoria em segurança ocupacional',
      id_empresa_cliente: 2,
      id_empresa_prestadora: 1,
      empresa_cliente: {
        id: 2,
        nome_razao: 'XYZ Serviços S.A.',
        cpf_cnpj: '98.765.432/0001-10'
      },
      empresa_prestadora: {
        id: 1,
        nome_razao: 'ScPrevenção',
        cpf_cnpj: '99.999.999/0001-99'
      }
    },
    {
      id: 3,
      numero: 'CT-2024-015',
      data_inicio: '2024-06-01T00:00:00Z',
      data_fim: '2024-12-31T23:59:59Z',
      status_contrato: StatusContrato.Suspenso,
      path_file: '/contratos/ct-2024-015.pdf',
      valor: 45000.00,
      observacoes: 'Contrato suspenso temporariamente por solicitação do cliente',
      id_empresa_cliente: 3,
      id_empresa_prestadora: 2,
      empresa_cliente: {
        id: 3,
        nome_razao: 'Tech Solutions Ltda',
        cpf_cnpj: '11.222.333/0001-44'
      },
      empresa_prestadora: {
        id: 2,
        nome_razao: 'SafeWork Consultoria',
        cpf_cnpj: '88.888.888/0001-88'
      }
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusContrato | 'all'>('all')

  const filteredContratos = contratos.filter(contrato => {
    const matchesSearch = 
      contrato.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.empresa_cliente?.nome_razao.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || contrato.status_contrato === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSave = (contrato: Contrato) => {
    if (editingContrato) {
      // Atualizar contrato existente
      setContratos(prev => prev.map(c => 
        c.id === editingContrato.id ? { ...contrato, id: editingContrato.id } : c
      ))
    } else {
      // Adicionar novo contrato
      const newId = Math.max(...contratos.map(c => c.id || 0)) + 1
      setContratos(prev => [...prev, { ...contrato, id: newId }])
    }
    
    setShowForm(false)
    setEditingContrato(null)
  }

  const handleEdit = (contrato: Contrato) => {
    setEditingContrato(contrato)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      setContratos(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingContrato(null)
  }

  const getStatusBadge = (status: StatusContrato) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    
    switch (status) {
      case StatusContrato.Ativo:
        return `${baseClasses} bg-green-100 text-green-800`
      case StatusContrato.Inativo:
        return `${baseClasses} bg-red-100 text-red-800`
      case StatusContrato.Suspenso:
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (showForm) {
    return (
      <ContratoForm
        contrato={editingContrato}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Contratos</h1>
        <p className="text-gray-600">Gerencie os contratos de prestação de serviços</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Contratos</p>
              <p className="text-2xl font-bold text-gray-900">{contratos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contratos Ativos</p>
              <p className="text-2xl font-bold text-green-600">{contratos.filter(c => c.status_contrato === StatusContrato.Ativo).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contratos Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{contratos.filter(c => new Date(c.data_fim) < new Date()).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vencendo em 30 dias</p>
              <p className="text-2xl font-bold text-yellow-600">{contratos.filter(c => {
                const dataFim = new Date(c.data_fim)
                const hoje = new Date()
                const em30Dias = new Date()
                em30Dias.setDate(hoje.getDate() + 30)
                return dataFim >= hoje && dataFim <= em30Dias
              }).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por número ou empresa cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusContrato | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">Todos os status</option>
              <option value={StatusContrato.Ativo}>Ativo</option>
              <option value={StatusContrato.Inativo}>Inativo</option>
              <option value={StatusContrato.Suspenso}>Suspenso</option>
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
            >
              Novo Contrato
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Contratos */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContratos.map((contrato) => (
                <tr key={contrato.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contrato.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{contrato.empresa_cliente.nome_razao}</div>
                      <div className="text-gray-500">{contrato.empresa_cliente.cpf_cnpj}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(contrato.data_inicio)} - {formatDate(contrato.data_fim)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(contrato.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(contrato.status_contrato)}>
                      {getStatusLabel(contrato.status_contrato)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedContrato(contrato)
                          setShowForm(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(contrato.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContratos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhum contrato encontrado com os filtros aplicados.' 
                : 'Nenhum contrato cadastrado.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}