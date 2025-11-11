'use client'

import { useState, useEffect, useMemo } from 'react'
import { EmpresaForm } from '../../../components/EmpresaForm'
import { apiEmpresas } from '@/lib/api_empresas'
import { Empresa, EmpresaFormData } from '@/types/empresas'


export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar empresas filtradas
  useEffect(() => {
    const initializeEnderecos = async () => {
      try {
        const empresasData = await apiEmpresas.getEmpresas();
        console.log(empresasData)
        setEmpresas(empresasData)
      } catch (error) {
        console.error('Erro ao inicializar empresas:', error)
      }
    }

    initializeEnderecos()

  }, [])

  const filteredEmpresas = useMemo(() => {
    return empresas.filter(empresa => {
      const matchesSearch = searchTerm === '' ||
        empresa.nomeRazao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.cpfCnpj.includes(searchTerm) ||
        empresa.email?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [empresas, searchTerm,])

  // Calcular estatísticas das empresas
  const totalEmpresas = empresas.length
  const empresasAtivas = empresas.filter(empresa => empresa.status).length
  const empresasInativas = empresas.filter(empresa => !empresa.status).length

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleEditEmpresa = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setShowForm(true)
  }

  const handleSaveEmpresa = (empresaData: EmpresaFormData) => {
    if (editingEmpresa) {
      // Editar empresa existente
      apiEmpresas.updateEmpresas(editingEmpresa.id, empresaData as Empresa).then((updateEmpresa) => {
        setEmpresas(prev => prev.map(empresa =>
          empresa.id === updateEmpresa.id ? updateEmpresa : empresa
        ))
      }).catch((error) => {
        console.error('Erro ao atualizar empresa:', error)
      })
    } else {
      // Criar nova empresa
      apiEmpresas.createEmpresas(empresaData as Empresa).then((newEmpresa) => {
        setEmpresas(prev => [...prev, newEmpresa])
      }).catch((error) => {
        console.error('Erro ao criar empresa:', error)
      })
    }

    setShowForm(false)
    setEditingEmpresa(null)
  }

  const handleDeleteEmpresa = (id: number) => {
    if (window.confirm(`Tem certeza que deseja excluir a empresa?`)) {
      apiEmpresas.deleteEmpresas(id).then(() => {
        setEmpresas(prev => prev.filter(empresa => empresa.id !== id))
      }).catch((error) => {
        console.error('Erro ao excluir empresa:', error)
      })
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingEmpresa(null)
  }

  if (showForm) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={handleCancelForm}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Voltar para lista
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
          </h1>
        </div>
        <EmpresaForm
          empresa={editingEmpresa}
          onSave={handleSaveEmpresa}
          onCancel={handleCancelForm}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nova Empresa
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total de Empresas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total de Empresas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalEmpresas}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Empresas Ativas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Empresas Ativas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{empresasAtivas}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Empresas Inativas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Empresas Inativas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{empresasInativas}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campo de pesquisa */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Pesquisar empresas..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>


      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Empresas</h2>
            {searchTerm && (
              <span className="text-sm text-gray-500">
                {filteredEmpresas.length} resultado(s) encontrado(s)
              </span>
            )}
          </div>
          {filteredEmpresas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? 'Nenhuma empresa encontrada para a pesquisa.' : 'Nenhuma empresa cadastrada ainda.'}
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
                  {filteredEmpresas.map((empresa) => (
                    <tr key={empresa.id}>
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
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border-2 ${empresa.tipoPessoa === 'Fisica'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                          {empresa.tipoPessoa === 'Fisica' ? 'PF' : 'PJ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.cpfCnpj}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${empresa.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {empresa.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditEmpresa(empresa)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteEmpresa(empresa.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
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