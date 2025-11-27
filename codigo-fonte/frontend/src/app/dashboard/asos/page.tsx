'use client'

import { useEffect, useMemo, useState } from 'react'

import { Aso, AsoFormValues, StatusAso, TipoAso } from '@/types/aso'
import { Colaborador } from '@/types/colaborador'
import {
  createAso,
  deleteAso,
  getAsos,
  getColaboradores,
  updateAso
} from '@/lib/api'
import AsoForm from '@/components/AsoForm'

type RequestState = 'idle' | 'loading' | 'saving'

const getTipoLabel = (tipo: TipoAso) => {
  switch (tipo) {
    case TipoAso.Admissional:
      return 'Admissional'
    case TipoAso.Periodico:
      return 'Periódico'
    case TipoAso.RetornoAoTrabalho:
      return 'Retorno ao Trabalho'
    case TipoAso.MudancaDeFuncao:
      return 'Mudança de Função'
    case TipoAso.Demissional:
      return 'Demissional'
    default:
      return 'Desconhecido'
  }
}

const getStatusLabel = (status: StatusAso) => {
  switch (status) {
    case StatusAso.Valido:
      return 'Válido'
    case StatusAso.Vencido:
      return 'Vencido'
    case StatusAso.Aguardando:
      return 'Aguardando'
    case StatusAso.Cancelado:
      return 'Cancelado'
    default:
      return 'Desconhecido'
  }
}

const getStatusBadgeClass = (status: StatusAso) => {
  switch (status) {
    case StatusAso.Valido:
      return 'bg-green-100 text-green-800'
    case StatusAso.Vencido:
      return 'bg-red-100 text-red-800'
    case StatusAso.Aguardando:
      return 'bg-yellow-100 text-yellow-800'
    case StatusAso.Cancelado:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (value: string) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '-'

export default function AsosPage() {
  const [asos, setAsos] = useState<Aso[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusAso | 'all'>('all')
  const [tipoFilter, setTipoFilter] = useState<TipoAso | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingAso, setEditingAso] = useState<Aso | null>(null)
  const [state, setState] = useState<RequestState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setState('loading')
      try {
        const [asosData, colaboradoresData] = await Promise.all([
          getAsos(),
          getColaboradores()
        ])

        setAsos(asosData)
        setColaboradores(colaboradoresData)
        setErrorMessage(null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os dados de ASO.'
        setErrorMessage(message)
      } finally {
        setState('idle')
      }
    }

    fetchData()
  }, [])

  const colaboradoresById = useMemo(() => {
    const map = new Map<number, Colaborador>()
    colaboradores.forEach(colaborador => {
      map.set(colaborador.id, colaborador)
    })
    return map
  }, [colaboradores])

  const filteredAsos = useMemo(() => {
    return asos.filter(aso => {
      const colaborador = colaboradoresById.get(aso.idColaborador)
      const matchesStatus =
        statusFilter === 'all' || aso.status === statusFilter
      const matchesTipo = tipoFilter === 'all' || aso.tipoAso === tipoFilter

      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        query.length === 0 ||
        colaborador?.nomeRazao.toLowerCase().includes(query) ||
        (colaborador?.empresaClienteNome ?? '')
          .toLowerCase()
          .includes(query) ||
        (colaborador?.funcao ?? '').toLowerCase().includes(query) ||
        getTipoLabel(aso.tipoAso).toLowerCase().includes(query)

      return matchesStatus && matchesTipo && matchesSearch
    })
  }, [asos, colaboradoresById, searchTerm, statusFilter, tipoFilter])

  const stats = useMemo(() => {
    const total = asos.length
    const validas = asos.filter(aso => aso.status === StatusAso.Valido).length
    const vencidas = asos.filter(aso => aso.status === StatusAso.Vencido).length
    const aguardando = asos.filter(
      aso => aso.status === StatusAso.Aguardando
    ).length

    return { total, validas, vencidas, aguardando }
  }, [asos])

  const handleSave = async (data: AsoFormValues) => {
    try {
      setState('saving')
      setErrorMessage(null)

      if (editingAso) {
        const updated = await updateAso(editingAso.id, data)
        setAsos(prev =>
          prev.map(item => (item.id === updated.id ? updated : item))
        )
      } else {
        const created = await createAso(data)
        setAsos(prev => [...prev, created])
      }

      setShowForm(false)
      setEditingAso(null)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a ASO.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const handleDelete = async (aso: Aso) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir a ASO do colaborador ${colaboradoresById.get(aso.idColaborador)?.nomeRazao ?? ''}?`
    )

    if (!confirmed) return

    try {
      setState('saving')
      setErrorMessage(null)
      await deleteAso(aso.id)
      setAsos(prev => prev.filter(item => item.id !== aso.id))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a ASO.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const isLoading = state === 'loading'
  const isSaving = state === 'saving'

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Gerenciamento de ASOs
        </h1>
        <p className="text-gray-600">
          Acompanhe e mantenha os atestados de saúde ocupacional dos
          colaboradores atualizados.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total de ASOs</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {isLoading ? '-' : stats.total}
          </p>
        </div>
        <div className="rounded-lg border border-green-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">ASOs Válidas</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {isLoading ? '-' : stats.validas}
          </p>
        </div>
        <div className="rounded-lg border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">ASOs Vencidas</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {isLoading ? '-' : stats.vencidas}
          </p>
        </div>
        <div className="rounded-lg border border-yellow-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Aguardando</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {isLoading ? '-' : stats.aguardando}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por colaborador, empresa ou tipo de ASO..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={event =>
              setStatusFilter(
                event.target.value === 'all'
                  ? 'all'
                  : (Number(event.target.value) as StatusAso)
              )
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            {Object.values(StatusAso)
              .filter(value => typeof value === 'number')
              .map(value => (
                <option key={value} value={value}>
                  {getStatusLabel(value as StatusAso)}
                </option>
              ))}
          </select>

          <select
            value={tipoFilter}
            onChange={event =>
              setTipoFilter(
                event.target.value === 'all'
                  ? 'all'
                  : (Number(event.target.value) as TipoAso)
              )
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos os tipos</option>
            {Object.values(TipoAso)
              .filter(value => typeof value === 'number')
              .map(value => (
                <option key={value} value={value}>
                  {getTipoLabel(value as TipoAso)}
                </option>
              ))}
          </select>

          <button
            onClick={() => {
              setEditingAso(null)
              setShowForm(true)
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            Nova ASO
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Validade
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
                    Carregando ASOs...
                  </td>
                </tr>
              ) : filteredAsos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' || tipoFilter !== 'all'
                      ? 'Nenhuma ASO encontrada com os filtros aplicados.'
                      : 'Nenhuma ASO cadastrada até o momento.'}
                  </td>
                </tr>
              ) : (
                filteredAsos.map(aso => {
                  const colaborador = colaboradoresById.get(aso.idColaborador)

                  return (
                    <tr key={aso.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">
                          {colaborador?.nomeRazao ?? 'Colaborador não encontrado'}
                        </div>
                        <div className="text-gray-500">
                          {colaborador?.empresaClienteNome ?? ''}
                          {colaborador?.funcao ? ` • ${colaborador.funcao}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getTipoLabel(aso.tipoAso)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(aso.dataSolicitacao)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(aso.dataValidade)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                            aso.status
                          )}`}
                        >
                          {getStatusLabel(aso.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditingAso(aso)
                              setShowForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSaving}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(aso)}
                            className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSaving}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <AsoForm
          aso={editingAso}
          colaboradores={colaboradores.map(colaborador => ({
            id: colaborador.id,
            nome: colaborador.nomeRazao,
            empresa: colaborador.empresaClienteNome ?? ''
          }))}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingAso(null)
          }}
        />
      )}
    </div>
  )
}

