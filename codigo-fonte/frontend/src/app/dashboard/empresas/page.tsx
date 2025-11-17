'use client'

import { useEffect, useMemo, useState } from 'react'

import { Empresa, EmpresaFormData } from '@/types/empresas'
import { EmpresaForm } from '@/components/EmpresaForm'
import { apiClient } from '@/lib/api'

type RequestState = 'idle' | 'loading' | 'saving'

const formatDocument = (value: string, tipoPessoa: Empresa['tipoPessoa']) => {
  if (!value) return '-'

  if (tipoPessoa === 'Fisica') {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [state, setState] = useState<RequestState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmpresas = async () => {
      setState('loading')
      try {
        const data = await apiClient.getEmpresas()
        setEmpresas(data)
        setErrorMessage(null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar as empresas.'
        setErrorMessage(message)
      } finally {
        setState('idle')
      }
    }

    fetchEmpresas()
  }, [])

  const filteredEmpresas = useMemo(() => {
    if (!searchTerm) {
      return empresas
    }

    const normalized = searchTerm.trim().toLowerCase()

    return empresas.filter(empresa => {
      return (
        empresa.nomeRazao.toLowerCase().includes(normalized) ||
        (empresa.nomeFantasia?.toLowerCase().includes(normalized) ?? false) ||
        empresa.cpfCnpj.includes(searchTerm.replace(/\D/g, '')) ||
        (empresa.email?.toLowerCase().includes(normalized) ?? false)
      )
    })
  }, [empresas, searchTerm])

  const totalEmpresas = empresas.length
  const empresasAtivas = empresas.filter(empresa => empresa.status).length
  const empresasInativas = totalEmpresas - empresasAtivas

  const handleAddEmpresa = () => {
    setEditingEmpresa(null)
    setShowForm(true)
  }

  const handleEditEmpresa = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingEmpresa(null)
  }

  const handleSaveEmpresa = async (data: EmpresaFormData) => {
    try {
      setState('saving')
      setErrorMessage(null)

      if (editingEmpresa) {
        const updated = await apiClient.updateEmpresa(editingEmpresa.id, data)
        setEmpresas(prev =>
          prev.map(item => (item.id === updated.id ? updated : item))
        )
      } else {
        const created = await apiClient.createEmpresa(data)
        setEmpresas(prev => [...prev, created])
      }

      resetForm()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a empresa.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const handleDeleteEmpresa = async (empresa: Empresa) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a empresa "${empresa.nomeRazao}"?`
    )

    if (!confirmed) return

    try {
      setState('saving')
      setErrorMessage(null)

      await apiClient.deleteEmpresa(empresa.id)

      setEmpresas(prev => prev.filter(item => item.id !== empresa.id))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a empresa.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const isLoading = state === 'loading'
  const isSaving = state === 'saving'

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600">
            Gerencie as empresas clientes vinculadas à prestadora.
          </p>
        </div>
        <button
          onClick={handleAddEmpresa}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          Nova Empresa
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Total de Empresas
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isLoading ? '-' : totalEmpresas}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🏢</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Empresas Ativas
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isLoading ? '-' : empresasAtivas}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Empresas Inativas
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isLoading ? '-' : empresasInativas}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">⏸️</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Pesquisar empresas..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <EmpresaForm
            empresa={editingEmpresa}
            onSave={handleSaveEmpresa}
            onCancel={resetForm}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Empresas
            </h2>
            {searchTerm && (
              <span className="text-sm text-gray-500">
                {filteredEmpresas.length} resultado(s) encontrado(s)
              </span>
            )}
          </div>

          {isLoading ? (
            <p className="py-12 text-center text-gray-500">
              Carregando empresas...
            </p>
          ) : filteredEmpresas.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              {searchTerm
                ? 'Nenhuma empresa encontrada para a pesquisa.'
                : 'Nenhuma empresa cadastrada ainda.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome/Razão Social
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Pessoa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF/CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmpresas.map(empresa => (
                    <tr key={empresa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {empresa.nomeRazao}
                          </div>
                          {empresa.nomeFantasia && (
                            <div className="text-sm text-gray-500">
                              {empresa.nomeFantasia}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border-2 ${empresa.tipoPessoa === 'Fisica'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                        >
                          {empresa.tipoPessoa === 'Fisica' ? 'PF' : 'PJ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDocument(empresa.cpfCnpj, empresa.tipoPessoa)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.email ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${empresa.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {empresa.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditEmpresa(empresa)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={isSaving}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEmpresa(empresa)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isSaving}
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
          )}
        </div>
      </div>
    </div>
  )
}
