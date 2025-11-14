'use client'

import { useEffect, useMemo, useState } from 'react'

import { Empresa } from '@/types/empresas'
import { Contrato, ContratoFormValues, StatusContrato } from '@/types/contrato'

interface ContratoFormProps {
  contrato?: Contrato | null
  empresas: Empresa[]
  empresaPrestadoraId: number
  onSave: (data: ContratoFormValues) => void
  onCancel: () => void
}

const DEFAULT_FORM: ContratoFormValues = {
  numero: '',
  dataInicio: '',
  dataFim: '',
  statusContrato: StatusContrato.Ativo,
  pathFile: '',
  valor: '',
  observacoes: '',
  idEmpresaCliente: 0,
  idEmpresaPrestadora: 0
}

const formatCurrency = (value: string) => {
  const numeric = value.replace(/\D/g, '')
  const amount = Number(numeric) / 100

  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const parseCurrencyToNumber = (value: string) => {
  if (!value) return 0
  const numeric = value.replace(/[R$\s.]/g, '').replace(',', '.')
  return Number(numeric) || 0
}

const statusOptions: StatusContrato[] = [
  StatusContrato.Ativo,
  StatusContrato.Inativo,
  StatusContrato.Suspenso
]

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

export function ContratoForm({
  contrato,
  empresas,
  empresaPrestadoraId,
  onSave,
  onCancel
}: ContratoFormProps) {
  const [formData, setFormData] = useState<ContratoFormValues>({
    ...DEFAULT_FORM,
    idEmpresaPrestadora: empresaPrestadoraId
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!contrato) {
      setFormData({
        ...DEFAULT_FORM,
        idEmpresaPrestadora: empresaPrestadoraId
      })
      return
    }

    setFormData({
      numero: contrato.numero,
      dataInicio: contrato.dataInicio.split('T')[0],
      dataFim: contrato.dataFim.split('T')[0],
      statusContrato: contrato.statusContrato,
      pathFile: contrato.pathFile ?? '',
      valor: formatCurrency(String(contrato.valor)),
      observacoes: contrato.observacoes ?? '',
      idEmpresaCliente: contrato.idEmpresaCliente,
      idEmpresaPrestadora: contrato.idEmpresaPrestadora
    })
  }, [contrato, empresaPrestadoraId])

  const empresasOrdenadas = useMemo(
    () =>
      empresas
        .slice()
        .sort((a, b) => a.nomeRazao.localeCompare(b.nomeRazao, 'pt-BR')),
    [empresas]
  )

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target

    setFormData(prev => {
      if (name === 'idEmpresaCliente' || name === 'idEmpresaPrestadora') {
        return { ...prev, [name]: Number(value) }
      }

      if (name === 'statusContrato') {
        return { ...prev, statusContrato: Number(value) as StatusContrato }
      }

      return {
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }
    })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleValorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(event.target.value)
    setFormData(prev => ({ ...prev, valor: formatted }))

    if (errors.valor) {
      setErrors(prev => ({ ...prev, valor: '' }))
    }
  }

  const validate = () => {
    const validationErrors: Record<string, string> = {}

    if (!formData.numero.trim()) {
      validationErrors.numero = 'Número do contrato é obrigatório'
    }

    if (!formData.dataInicio) {
      validationErrors.dataInicio = 'Data de início é obrigatória'
    }

    if (!formData.dataFim) {
      validationErrors.dataFim = 'Data de fim é obrigatória'
    }

    if (formData.dataInicio && formData.dataFim) {
      const inicio = new Date(formData.dataInicio)
      const fim = new Date(formData.dataFim)

      if (fim <= inicio) {
        validationErrors.dataFim =
          'Data de fim deve ser posterior à data de início'
      }
    }

    if (!formData.valor.trim()) {
      validationErrors.valor = 'Valor do contrato é obrigatório'
    }

    if (!formData.idEmpresaCliente) {
      validationErrors.idEmpresaCliente = 'Selecione a empresa cliente'
    }

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate()) return

    onSave({
      ...formData,
      valor: formData.valor,
      pathFile: formData.pathFile?.trim(),
      observacoes: formData.observacoes?.trim(),
      idEmpresaPrestadora: formData.idEmpresaPrestadora || empresaPrestadoraId
    })
  }

  const valorNumerico = parseCurrencyToNumber(formData.valor)

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        {contrato ? 'Editar Contrato' : 'Novo Contrato'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="numero">
              Número do Contrato *
            </label>
            <input
              id="numero"
              name="numero"
              type="text"
              value={formData.numero}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.numero ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Informe o número do contrato"
            />
            {errors.numero && (
              <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-900"
              htmlFor="statusContrato"
            >
              Status *
            </label>
            <select
              id="statusContrato"
              name="statusContrato"
              value={formData.statusContrato}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {getStatusLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="dataInicio">
              Data de Início *
            </label>
            <input
              id="dataInicio"
              name="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.dataInicio ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.dataInicio && (
              <p className="mt-1 text-sm text-red-600">{errors.dataInicio}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="dataFim">
              Data de Fim *
            </label>
            <input
              id="dataFim"
              name="dataFim"
              type="date"
              value={formData.dataFim}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.dataFim ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.dataFim && (
              <p className="mt-1 text-sm text-red-600">{errors.dataFim}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="valor">
              Valor do Contrato *
            </label>
            <input
              id="valor"
              name="valor"
              type="text"
              value={formData.valor}
              onChange={handleValorChange}
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.valor ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="R$ 0,00"
            />
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Valor numérico: {valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-900"
              htmlFor="pathFile"
            >
              Arquivo do Contrato
            </label>
            <input
              id="pathFile"
              name="pathFile"
              type="text"
              value={formData.pathFile ?? ''}
              onChange={handleChange}
              placeholder="Caminho ou URL (opcional)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              className="mb-2 block text-sm font-medium text-gray-900"
              htmlFor="idEmpresaCliente"
            >
              Empresa Cliente *
            </label>
            <select
              id="idEmpresaCliente"
              name="idEmpresaCliente"
              value={formData.idEmpresaCliente}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.idEmpresaCliente ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value={0}>Selecione uma empresa cliente</option>
              {empresasOrdenadas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nomeRazao} • {empresa.cpfCnpj}
                </option>
              ))}
            </select>
            {errors.idEmpresaCliente && (
              <p className="mt-1 text-sm text-red-600">{errors.idEmpresaCliente}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Empresa Prestadora
            </label>
            <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {contrato?.empresaPrestadora?.nomeRazao ?? 'ScPrevenção'}
            </p>
          </div>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-gray-900"
            htmlFor="observacoes"
          >
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes ?? ''}
            onChange={handleChange}
            rows={4}
            placeholder="Informações adicionais sobre o contrato (opcional)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {contrato ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

