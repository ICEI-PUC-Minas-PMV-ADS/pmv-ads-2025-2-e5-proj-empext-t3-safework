'use client'

import { useEffect, useMemo, useState } from 'react'

import { Usuario } from '@/types/usuario'
import { UsuarioForm } from '@/components/UsuarioForm'
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario
} from '@/lib/api'

type RequestState = 'idle' | 'loading' | 'saving'

const perfilLabels: Record<number, string> = {
  1: 'Root',
  2: 'Administrador',
  3: 'Usuário'
}

const perfilBadgeColor: Record<number, string> = {
  1: 'bg-red-100 text-red-800 border-red-200',
  2: 'bg-blue-100 text-blue-800 border-blue-200',
  3: 'bg-green-100 text-green-800 border-green-200'
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [state, setState] = useState<RequestState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      setState('loading')
      try {
        const data = await getUsuarios()
        setUsuarios(data)
        setErrorMessage(null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os usuários.'
        setErrorMessage(message)
      } finally {
        setState('idle')
      }
    }

    fetchUsuarios()
  }, [])

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) {
      return usuarios
    }

    const normalized = searchTerm.trim().toLowerCase()

    return usuarios.filter(usuario => {
      return (
        usuario.nomeCompleto.toLowerCase().includes(normalized) ||
        usuario.email.toLowerCase().includes(normalized)
      )
    })
  }, [usuarios, searchTerm])

  const totalUsuarios = usuarios.length
  const administradores = usuarios.filter(
    usuario => usuario.idPerfil === 2
  ).length
  const usuariosComuns = usuarios.filter(
    usuario => usuario.idPerfil === 3
  ).length

  const handleAddUsuario = () => {
    setEditingUsuario(null)
    setShowForm(true)
  }

  const handleEditUsuario = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingUsuario(null)
  }

  const handleSaveUsuario = async (data: {
    nomeCompleto: string
    email: string
    senha?: string
    idPerfil: number
  }) => {
    try {
      setState('saving')
      setErrorMessage(null)

      if (editingUsuario) {
        const updated = await updateUsuario(editingUsuario.id, data)
        setUsuarios(prev =>
          prev.map(usuario =>
            usuario.id === updated.id ? updated : usuario
          )
        )
      } else {
        const created = await createUsuario(data)
        setUsuarios(prev => [...prev, created])
      }

      handleCancelForm()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o usuário.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const handleDeleteUsuario = async (usuario: Usuario) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o usuário "${usuario.nomeCompleto}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      setState('saving')
      setErrorMessage(null)

      await deleteUsuario(usuario.id)

      setUsuarios(prev => prev.filter(item => item.id !== usuario.id))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o usuário.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const isLoading = state === 'loading'
  const isSaving = state === 'saving'

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">
            Gerencie os usuários com acesso ao sistema.
          </p>
        </div>
        <button
          onClick={handleAddUsuario}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
        >
          Novo Usuário
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              👥
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total de Usuários
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : totalUsuarios}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              🛡️
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Administradores
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : administradores}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              💼
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Usuários Comuns
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : usuariosComuns}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <UsuarioForm
            usuario={editingUsuario}
            onSave={handleSaveUsuario}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nome Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Carregando usuários...
                  </td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {searchTerm
                      ? 'Nenhum usuário encontrado com os filtros informados.'
                      : 'Nenhum usuário cadastrado até o momento.'}
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map(usuario => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nomeCompleto}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          perfilBadgeColor[usuario.idPerfil] ||
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {perfilLabels[usuario.idPerfil] ?? 'Desconhecido'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEditUsuario(usuario)}
                          className="text-blue-600 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSaving}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUsuario(usuario)}
                          className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSaving}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

