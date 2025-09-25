'use client'

import { useState, useEffect } from 'react'
import { UsuarioForm, Usuario } from '../../../components/UsuarioForm'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      nome_completo: 'João Silva Santos',
      email: 'joao.santos@safework.com',
      senha: 'hashed_password_1',
      id_empresa_prestadora: 1,
      id_perfil: 2,
      status: true
    },
    {
      id: 2,
      nome_completo: 'Maria Oliveira Costa',
      email: 'maria.costa@safework.com',
      senha: 'hashed_password_2',
      id_empresa_prestadora: 1,
      id_perfil: 3,
      status: true
    },
    {
      id: 3,
      nome_completo: 'Carlos Eduardo Lima',
      email: 'carlos.lima@safework.com',
      senha: 'hashed_password_3',
      id_empresa_prestadora: 2,
      id_perfil: 2,
      status: false
    },
    {
      id: 4,
      nome_completo: 'Ana Paula Ferreira',
      email: 'ana.ferreira@safework.com',
      senha: 'hashed_password_4',
      id_empresa_prestadora: null,
      id_perfil: 3,
      status: true
    }
  ])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar usuários filtrados
  useEffect(() => {
    setFilteredUsuarios(usuarios)
  }, [usuarios])

  // Filtrar usuários em tempo real
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsuarios(usuarios)
    } else {
      const filtered = usuarios.filter(usuario =>
        usuario.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsuarios(filtered)
    }
  }, [searchTerm, usuarios])

  // Calcular estatísticas dos usuários
  const totalUsuarios = usuarios.length
  const administradores = usuarios.filter(usuario => usuario.id_perfil === 2).length
  const usuariosComuns = usuarios.filter(usuario => usuario.id_perfil === 3).length

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleAddUsuario = () => {
    setEditingUsuario(null)
    setShowForm(true)
  }

  const handleEditUsuario = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setShowForm(true)
  }

  const handleSaveUsuario = (usuario: Usuario) => {
    setIsLoading(true)
    
    // Simular delay de API
    setTimeout(() => {
      if (editingUsuario) {
        // Atualizar usuário existente
        setUsuarios(prev => prev.map(u => 
          u.id === editingUsuario.id ? { ...usuario, id: editingUsuario.id } : u
        ))
      } else {
        // Adicionar novo usuário
        const newId = Math.max(...usuarios.map(u => u.id || 0)) + 1
        setUsuarios(prev => [...prev, { ...usuario, id: newId }])
      }
      
      setShowForm(false)
      setEditingUsuario(null)
      setIsLoading(false)
    }, 1000)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingUsuario(null)
  }

  const handleDeleteUsuario = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id))
    }
  }

  const getPerfilNome = (idPerfil: number) => {
    switch (idPerfil) {
      case 1:
        return 'Root'
      case 2:
        return 'Administrador'
      case 3:
        return 'Usuário'
      default:
        return 'Desconhecido'
    }
  }

  const getPerfilBadgeColor = (idPerfil: number) => {
    switch (idPerfil) {
      case 1:
        return 'bg-red-100 text-red-800 border-red-200'
      case 2:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 3:
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (showForm) {
    return (
      <div className="p-6">
        <UsuarioForm
          usuario={editingUsuario}
          onSave={handleSaveUsuario}
          onCancel={handleCancelForm}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-600">Gerencie os usuários do sistema</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsuarios}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">{administradores}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{usuariosComuns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddUsuario}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perfil
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
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.nome_completo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPerfilBadgeColor(usuario.id_perfil)}`}>
                      {getPerfilNome(usuario.id_perfil)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.status 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {usuario.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUsuario(usuario)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUsuario(usuario.id!)}
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

          {filteredUsuarios.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando um novo usuário.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}