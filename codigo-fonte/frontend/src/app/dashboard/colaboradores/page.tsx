'use client'

import { useState, useMemo } from 'react'
import { Colaborador, ColaboradorFormData } from '../../../types/colaborador'

export default function ColaboradoresPage() {
  // Mock data para colaboradores
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([
    {
      id: 1,
      nome_razao: 'João Silva Santos',
      cpf_cnpj: '12345678901',
      tipo_pessoa: 1,
      data_nascimento: '1985-03-15',
      telefone: '(11) 3456-7890',
      celular: '(11) 99876-5432',
      email: 'joao.silva@empresa.com',
      funcao: 'Analista de Sistemas',
      cargo: 'Analista de Sistemas Sênior',
      setor: 'Tecnologia da Informação',
      data_admissao: '2020-01-15',
      id_empresa_cliente: 1,
      tipo_sanguineo: 'O+',
      alergias: 'Nenhuma',
      medicamentos_uso_continuo: 'Nenhum',
      historico_doencas: 'Nenhum',
      observacoes_medicas: '',
      status: true,
      id_endereco: 1,
      endereco: {
        id: 1,
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: '',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      }
    },
    {
      id: 2,
      nome_razao: 'Maria Oliveira Costa',
      cpf_cnpj: '98765432100',
      tipo_pessoa: 1,
      data_nascimento: '1990-07-22',
      telefone: '(11) 2345-6789',
      celular: '(11) 98765-4321',
      email: 'maria.oliveira@empresa.com',
      funcao: 'Gerente de Projetos',
      cargo: 'Gerente de Projetos Sênior',
      setor: 'Gestão de Projetos',
      data_admissao: '2019-03-10',
      id_empresa_cliente: 2,
      tipo_sanguineo: 'A+',
      alergias: 'Poeira',
      medicamentos_uso_continuo: 'Anti-histamínico',
      historico_doencas: 'Rinite alérgica',
      observacoes_medicas: '',
      status: true,
      id_endereco: 2,
      endereco: {
        id: 2,
        logradouro: 'Av. Paulista',
        numero: '456',
        complemento: '',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '04567-890'
      }
    }
  ])

  // Mock data para empresas clientes
  const empresasClientes = [
    { id: 1, nome: 'Tech Solutions Ltda' },
    { id: 2, nome: 'Inovação Digital S.A.' },
    { id: 3, nome: 'Consultoria Empresarial' }
  ]

  // Função para buscar o nome da empresa pelo ID
  const getEmpresaNome = (id_empresa_cliente: number) => {
    const empresa = empresasClientes.find(emp => emp.id === id_empresa_cliente)
    return empresa ? empresa.nome : 'Empresa não encontrada'
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [empresaFilter, setEmpresaFilter] = useState<number | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null)

  // Filtrar colaboradores
  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter(colaborador => {
      const matchesSearch = colaborador.nome_razao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           colaborador.cpf_cnpj.includes(searchTerm) ||
                           colaborador.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && colaborador.status) ||
                           (statusFilter === 'inactive' && !colaborador.status)
      
      const matchesEmpresa = empresaFilter === 'all' || colaborador.id_empresa_cliente === empresaFilter
      
      return matchesSearch && matchesStatus && matchesEmpresa
    })
  }, [colaboradores, searchTerm, statusFilter, empresaFilter])

  // Estatísticas
  const stats = useMemo(() => {
    const total = colaboradores.length
    const active = colaboradores.filter(c => c.status).length
    const inactive = colaboradores.filter(c => !c.status).length
    
    // Simular colaboradores com ASO vencendo (próximos 30 dias)
    const asoExpiring = Math.floor(total * 0.15) // 15% dos colaboradores
    
    return { total, active, inactive, asoExpiring }
  }, [colaboradores])

  const handleSaveColaborador = (colaboradorData: ColaboradorFormData) => {
    if (editingColaborador) {
      // Atualizar colaborador existente
      setColaboradores(prev => prev.map(c => 
        c.id === editingColaborador.id 
          ? { ...c, ...colaboradorData }
          : c
      ))
    } else {
      // Adicionar novo colaborador
      const newColaborador: Colaborador = {
        id: Math.max(...colaboradores.map(c => c.id || 0)) + 1,
        ...colaboradorData,
        tipo_pessoa: 1,
        status: true,
        id_endereco: Math.max(...colaboradores.map(c => c.id_endereco || 0)) + 1
      }
      setColaboradores(prev => [...prev, newColaborador])
    }
    
    setShowForm(false)
    setEditingColaborador(null)
  }

  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      setColaboradores(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingColaborador(null)
  }

  const getEmpresaName = (id: number) => {
    const empresa = empresasClientes.find(e => e.id === id)
    return empresa ? empresa.nome : 'Empresa não encontrada'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (showForm) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h2>
          <p className="text-gray-600 mb-4">
            Formulário de colaborador será implementado aqui.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleCancel()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-600">Gerencie os colaboradores das empresas clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          Novo Colaborador
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">✗</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ASO Vencendo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.asoExpiring}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar colaboradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <select
            value={empresaFilter}
            onChange={(e) => setEmpresaFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as Empresas</option>
            {empresasClientes.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Colaboradores */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função/Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admissão
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
              {filteredColaboradores.map((colaborador) => (
                <tr key={colaborador.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {colaborador.nome_razao}
                      </div>
                      <div className="text-sm text-gray-500">
                        {colaborador.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {colaborador.cpf_cnpj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{colaborador.funcao}</div>
                    <div className="text-sm text-gray-500">{colaborador.cargo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getEmpresaNome(colaborador.id_empresa_cliente)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(colaborador.data_admissao)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      colaborador.status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {colaborador.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(colaborador)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar"
                      >
                        <span>✏️</span>
                      </button>
                      <button
                        onClick={() => handleDelete(colaborador.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Excluir"
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredColaboradores.length === 0 && (
          <div className="text-center py-12">
            <span className="mx-auto h-12 w-12 text-gray-400 text-4xl">👥</span>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum colaborador encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || empresaFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece adicionando um novo colaborador.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}