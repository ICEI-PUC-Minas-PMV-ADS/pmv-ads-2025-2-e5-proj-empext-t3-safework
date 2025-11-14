'use client'

import { useEffect, useMemo, useState } from 'react'

import { Contrato, ContratoFormValues, StatusContrato } from '@/types/contrato'
import { Empresa } from '@/types/empresas'
import {
  createContrato,
  deleteContrato,
  getContratos,
  getEmpresas,
  updateContrato
} from '@/lib/api'
import { ContratoForm } from '@/components/ContratoForm'

type RequestState = 'idle' | 'loading' | 'saving'

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (value: string) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '-'

const getStatusBadge = (status: StatusContrato) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case StatusContrato.Ativo:
      return `${base} bg-green-100 text-green-800`
    case StatusContrato.Inativo:
      return `${base} bg-red-100 text-red-800`
    case StatusContrato.Suspenso:
      return `${base} bg-yellow-100 text-yellow-800`
    default:
      return `${base} bg-gray-100 text-gray-800`
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

const parseCurrencyToNumber = (value: string) => {
  if (!value) return 0
  const numeric = value.replace(/[R$\s.]/g, '').replace(',', '.')
  return Number(numeric) || 0
}

const EMPRESA_PRESTADORA_PADRAO = 1

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusContrato | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null)
  const [state, setState] = useState<RequestState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setState('loading')
      try {
        const [contratosData, empresasData] = await Promise.all([
          getContratos(),
          getEmpresas()
        ])

        setContratos(contratosData)
        setEmpresas(empresasData)
        setErrorMessage(null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os contratos.'
        setErrorMessage(message)
      } finally {
        setState('idle')
      }
    }

    fetchData()
  }, [])

  const filteredContratos = useMemo(() => {
    return contratos.filter(contrato => {
      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        query.length === 0 ||
        contrato.numero.toLowerCase().includes(query) ||
        (contrato.empresaCliente?.nomeRazao ?? '')
          .toLowerCase()
          .includes(query)

      const matchesStatus =
        statusFilter === 'all' || contrato.statusContrato === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [contratos, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const total = contratos.length
    const ativos = contratos.filter(
      contrato => contrato.statusContrato === StatusContrato.Ativo
    ).length
    const vencidos = contratos.filter(
      contrato => new Date(contrato.dataFim) < new Date()
    ).length

    const hoje = new Date()
    const em30Dias = new Date()
    em30Dias.setDate(hoje.getDate() + 30)

    const vencendo = contratos.filter(contrato => {
      const fim = new Date(contrato.dataFim)
      return fim >= hoje && fim <= em30Dias
    }).length

    return { total, ativos, vencidos, vencendo }
  }, [contratos])

  const handleSave = async (data: ContratoFormValues) => {
    try {
      setState('saving')
      setErrorMessage(null)

      const payload = {
        numero: data.numero.trim(),
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        statusContrato: data.statusContrato,
        pathFile: data.pathFile?.trim() || null,
        valor: parseCurrencyToNumber(data.valor),
        observacoes: data.observacoes?.trim() || null,
        idEmpresaCliente: data.idEmpresaCliente,
        idEmpresaPrestadora:
          data.idEmpresaPrestadora || EMPRESA_PRESTADORA_PADRAO
      }

      if (editingContrato) {
        const updated = await updateContrato(editingContrato.id, payload)
        setContratos(prev =>
          prev.map(item => (item.id === updated.id ? updated : item))
        )
      } else {
        const created = await createContrato(payload)
        setContratos(prev => [...prev, created])
      }

      setShowForm(false)
      setEditingContrato(null)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o contrato.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const handleDelete = async (contrato: Contrato) => {
    const confirmed = window.confirm(
      `Excluir contrato ${contrato.numero}? Esta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    try {
      setState('saving')
      setErrorMessage(null)
      await deleteContrato(contrato.id)
      setContratos(prev => prev.filter(item => item.id !== contrato.id))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o contrato.'
      setErrorMessage(message)
    } finally {
      setState('idle')
    }
  }

  const isLoading = state === 'loading'
  const isSaving = state === 'saving'

  if (showForm) {
    return (
      <div className="p-6">
        <ContratoForm
          contrato={editingContrato}
          empresas={empresas}
          empresaPrestadoraId={EMPRESA_PRESTADORA_PADRAO}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingContrato(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Contratos
          </h1>
          <p className="text-gray-600">
            Controle contratos de prestação de serviços e acompanhe vencimentos.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingContrato(null)
            setShowForm(true)
          }}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
        >
          Novo Contrato
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {isLoading ? '-' : stats.total}
          </p>
        </div>
        <div className="rounded-lg border border-green-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Ativos</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {isLoading ? '-' : stats.ativos}
          </p>
        </div>
        <div className="rounded-lg border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Vencidos</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {isLoading ? '-' : stats.vencidos}
          </p>
        </div>
        <div className="rounded-lg border border-yellow-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Vencendo em 30 dias</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {isLoading ? '-' : stats.vencendo}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por número ou empresa cliente..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={event =>
            setStatusFilter(
              event.target.value === 'all'
                ? 'all'
                : (Number(event.target.value) as StatusContrato)
            )
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Todos os status</option>
          {Object.values(StatusContrato)
            .filter(value => typeof value === 'number')
            .map(value => (
              <option key={value} value={value}>
                {getStatusLabel(value as StatusContrato)}
              </option>
            ))}
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Empresa Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Carregando contratos...
                  </td>
                </tr>
              ) : filteredContratos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Nenhum contrato encontrado com os filtros aplicados.'
                      : 'Nenhum contrato cadastrado até o momento.'}
                  </td>
                </tr>
              ) : (
                filteredContratos.map(contrato => (
                  <tr key={contrato.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {contrato.numero}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">
                        {contrato.empresaCliente?.nomeRazao ?? '-'}
                      </div>
                      <div className="text-gray-500">
                        {contrato.empresaCliente?.cpfCnpj ?? ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(contrato.dataInicio)} • {formatDate(contrato.dataFim)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(contrato.valor)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(contrato.statusContrato)}>
                        {getStatusLabel(contrato.statusContrato)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setEditingContrato(contrato)
                            setShowForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSaving}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(contrato)}
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

