'use client'

import { useState, useEffect } from 'react'
import { EmpresaForm } from '../../../components/EmpresaForm'

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

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([
    {
      id: 1,
      tipo_pessoa: 2,
      cpf_cnpj: '12.345.678/0001-90',
      nome_razao: 'Empresa ABC Ltda',
      nome_fantasia: 'ABC Tech',
      telefone: '(11) 3456-7890',
      celular: '(11) 98765-4321',
      email: 'contato@abctech.com',
      status: true,
      id_endereco: 1
    },
    {
      id: 2,
      tipo_pessoa: 1,
      cpf_cnpj: '123.456.789-00',
      nome_razao: 'João Silva',
      nome_fantasia: 'Silva Consultoria',
      telefone: '(11) 2345-6789',
      celular: '(11) 87654-3210',
      email: 'joao@silva.com',
      status: true,
      id_endereco: 2
    },
    {
      id: 3,
      tipo_pessoa: 2,
      cpf_cnpj: '98.765.432/0001-10',
      nome_razao: 'XYZ Serviços S.A.',
      nome_fantasia: 'XYZ Corp',
      telefone: '(11) 4567-8901',
      celular: '(11) 76543-2109',
      email: 'info@xyzcorp.com',
      status: false,
      id_endereco: 3
    }
  ])
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar empresas filtradas
  useEffect(() => {
    setFilteredEmpresas(empresas)
  }, [empresas])

  // Filtrar empresas em tempo real
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmpresas(empresas)
    } else {
      const filtered = empresas.filter(empresa =>
        empresa.nome_razao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.cpf_cnpj.includes(searchTerm) ||
        empresa.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEmpresas(filtered)
    }
  }, [searchTerm, empresas])

  // Calcular estatísticas das empresas
  const totalEmpresas = empresas.length
  const empresasAtivas = empresas.filter(empresa => empresa.status).length
  const empresasInativas = empresas.filter(empresa => !empresa.status).length

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleAddEmpresa = () => {
    setEditingEmpresa(null)
    setShowForm(true)
  }

  const handleEditEmpresa = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEmpresa(null)
  }

  const handleSaveEmpresa = (empresa: Empresa) => {
    // Aqui seria implementada a lógica de salvar no backend
    console.log('Salvando empresa:', empresa)
    setShowForm(false)
    setEditingEmpresa(null)
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button
          onClick={handleAddEmpresa}
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

      {showForm && (
        <div className="mb-6">
          <EmpresaForm
            empresa={editingEmpresa}
            onSave={handleSaveEmpresa}
            onCancel={handleCloseForm}
          />
        </div>
      )}

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
                            {empresa.nome_razao}
                          </div>
                          {empresa.nome_fantasia && (
                            <div className="text-sm text-gray-500">
                              {empresa.nome_fantasia}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border-2 ${
                          empresa.tipo_pessoa === 1 
                            ? 'bg-purple-50 text-purple-800 border-purple-200' 
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {empresa.tipo_pessoa === 1 ? 'PF' : 'PJ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.cpf_cnpj}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          empresa.status 
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