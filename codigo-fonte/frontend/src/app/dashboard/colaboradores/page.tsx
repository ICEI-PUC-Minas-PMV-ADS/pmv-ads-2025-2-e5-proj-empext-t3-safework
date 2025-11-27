'use client'

import { useEffect, useMemo, useState } from 'react'

import { Colaborador, ColaboradorFormValues } from '@/types/colaborador'
import { ColaboradorForm } from '@/components/ColaboradorForm'
import {
  createColaborador,
  deleteColaborador,
  getColaboradores,
  getEmpresas,
  updateColaborador
} from '@/lib/api'
import { Empresa } from '@/types/empresas'

type RequestState = 'idle' | 'loading' | 'saving'

const formatDocument = (value: string, tipo: Colaborador['tipoPessoa']) => {
  if (!value) return '-'

  if (tipo === 'Fisica') {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [empresaFilter, setEmpresaFilter] = useState<number | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null)
  const [state, setState] = useState<RequestState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setState('loading')
      try {
        const [colaboradoresData, empresasData] = await Promise.all([
          getColaboradores(),
          getEmpresas()
        ])

        setColaboradores(colaboradoresData)
        setEmpresas(empresasData)
        setErrorMessage(null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os colaboradores.'
        setErrorMessage(message)
      } finally {
        setState('idle')
      }
    }

    fetchData()
  }, [])

  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter(colaborador => {
      const matchesSearch =
        colaborador.nomeRazao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colaborador.cpfCnpj.includes(searchTerm.replace(/\D/g, '')) ||
        (colaborador.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && colaborador.status) ||
        (statusFilter === 'inactive' && !colaborador.status)

      const matchesEmpresa =
        empresaFilter === 'all' || colaborador.idEmpresaCliente === empresaFilter

      return matchesSearch && matchesStatus && matchesEmpresa
    })
  }, [colaboradores, searchTerm, statusFilter, empresaFilter])

  const stats = useMemo(() => {
    const total = colaboradores.length
    const active = colaboradores.filter(c => c.status).length
    const inactive = total - active

    return { total, active, inactive }
  }, [colaboradores])

  const handleCreateColaborador = () => {
    setEditingColaborador(null)
    setShowForm(true)
  }

  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingColaborador(null)
  }

  const handleSave = async (data: ColaboradorFormValues) => {
    try {
      setState('saving')
      setErrorMessage(null)

      if (editingColaborador) {
        const updated = await updateColaborador(editingColaborador.id, data)
        setColaboradores(prev =>
          prev.map(item => (item.id === updated.id ? updated : item))
        )
      } else {
        const created = await createColaborador(data)
        setColaboradores(prev => [...prev, created])
      }

      handleCancel()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o colaborador.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const handleDelete = async (colaborador: Colaborador) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o colaborador "${colaborador.nomeRazao}"?`
    )

    if (!confirmed) return

    try {
      setState('saving')
      setErrorMessage(null)

      await deleteColaborador(colaborador.id)

      setColaboradores(prev => prev.filter(item => item.id !== colaborador.id))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o colaborador.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const isLoading = state === 'loading'
  const isSaving = state === 'saving'

  const empresasFilterOptions = useMemo(
    () =>
      empresas
        .slice()
        .sort((a, b) => a.nomeRazao.localeCompare(b.nomeRazao)),
    [empresas]
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-600">
            Gerencie os colaboradores das empresas clientes.
          </p>
        </div>
        <button
          onClick={handleCreateColaborador}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
        >
          Novo Colaborador
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              👥
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              ⏸️
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nome, documento ou email..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <select
            value={empresaFilter}
            onChange={event =>
              setEmpresaFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todas as empresas</option>
            {empresasFilterOptions.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nomeRazao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <ColaboradorForm
            colaborador={editingColaborador}
            empresas={empresas}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Empresa
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
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Carregando colaboradores...
                  </td>
                </tr>
              ) : filteredColaboradores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' || empresaFilter !== 'all'
                      ? 'Nenhum colaborador encontrado com os filtros informados.'
                      : 'Nenhum colaborador cadastrado até o momento.'}
                  </td>
                </tr>
              ) : (
                filteredColaboradores.map(colaborador => (
                  <tr key={colaborador.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {colaborador.nomeRazao}
                      </div>
                      {colaborador.email && (
                        <div className="text-sm text-gray-500">{colaborador.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDocument(colaborador.cpfCnpj, colaborador.tipoPessoa)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{colaborador.funcao}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {colaborador.empresaClienteNome ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colaborador.status
                            ? 'border-green-200 bg-green-100 text-green-800'
                            : 'border-red-200 bg-red-100 text-red-800'
                          }`}
                      >
                        {colaborador.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(colaborador)}
                          className="text-blue-600 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSaving}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(colaborador)}
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
