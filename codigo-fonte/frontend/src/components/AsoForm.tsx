'use client'

import { useEffect, useMemo, useState } from 'react'
import { Aso, AsoFormValues, StatusAso, TipoAso } from '@/types/aso'

interface ColaboradorOption {
  id: number
  nome: string
  empresa?: string
}

interface AsoFormProps {
  aso?: Aso | null
  colaboradores: ColaboradorOption[]
  onSave: (data: AsoFormValues) => void
  onCancel: () => void
}

const DEFAULT_FORM: AsoFormValues = {
  tipoAso: TipoAso.Admissional,
  dataSolicitacao: '',
  dataValidade: '',
  status: StatusAso.Aguardando,
  pathFile: '',
  observacoes: '',
  idColaborador: 0
}

const formatDateToInput = (value: string | undefined) => {
  if (!value) return ''
  if (value.includes('T')) return value.split('T')[0]
  return value
}

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

export default function AsoForm({ aso, colaboradores, onSave, onCancel }: AsoFormProps) {
  const [formData, setFormData] = useState<AsoFormValues>(DEFAULT_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!aso) {
      setFormData(DEFAULT_FORM)
      return
    }

    setFormData({
      tipoAso: aso.tipoAso,
      dataSolicitacao: formatDateToInput(aso.dataSolicitacao),
      dataValidade: formatDateToInput(aso.dataValidade),
      status: aso.status,
      pathFile: aso.pathFile ?? '',
      observacoes: aso.observacoes ?? '',
      idColaborador: aso.idColaborador
    })
  }, [aso])

  const tipoOptions = useMemo(
    () => Object.values(TipoAso).filter(value => typeof value === 'number') as TipoAso[],
    []
  )

  const statusOptions = useMemo(
    () => Object.values(StatusAso).filter(value => typeof value === 'number') as StatusAso[],
    []
  )

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setFormData(prev => {
      if (name === 'tipoAso' || name === 'status' || name === 'idColaborador') {
        return { ...prev, [name]: Number(value) }
      }

      return { ...prev, [name]: value }
    })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const validationErrors: Record<string, string> = {}

    if (!formData.idColaborador) {
      validationErrors.idColaborador = 'Colaborador é obrigatório'
    }

    if (!formData.dataSolicitacao) {
      validationErrors.dataSolicitacao = 'Data de solicitação é obrigatória'
    }

    if (!formData.dataValidade) {
      validationErrors.dataValidade = 'Data de validade é obrigatória'
    }

    if (formData.dataSolicitacao && formData.dataValidade) {
      const solicitacao = new Date(formData.dataSolicitacao)
      const validade = new Date(formData.dataValidade)

      if (validade <= solicitacao) {
        validationErrors.dataValidade = 'Data de validade deve ser posterior à data de solicitação'
      }
    }

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate()) return

    // Prepara os dados garantindo formato correto das datas
    const dataToSend: AsoFormValues = {
      tipoAso: formData.tipoAso,
      status: formData.status,
      idColaborador: formData.idColaborador,

      // Converte as datas para ISO 8601 completo
      dataSolicitacao: formData.dataSolicitacao
        ? new Date(formData.dataSolicitacao + 'T00:00:00').toISOString()
        : '',

      dataValidade: formData.dataValidade
        ? new Date(formData.dataValidade + 'T23:59:59').toISOString()
        : '',

      // Campos opcionais
      pathFile: formData.pathFile?.trim() || undefined,
      observacoes: formData.observacoes?.trim() || undefined
    }

    console.log('Dados ASO sendo enviados:', dataToSend) // Para debug

    onSave(dataToSend)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {aso ? 'Editar ASO' : 'Nova ASO'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-2xl text-gray-400 transition-colors hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="idColaborador"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Colaborador <span className="text-red-500">*</span>
              </label>
              <select
                id="idColaborador"
                name="idColaborador"
                value={formData.idColaborador}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.idColaborador ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value={0}>Selecione um colaborador</option>
                {colaboradores.map(colaborador => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.nome}
                    {colaborador.empresa ? ` - ${colaborador.empresa}` : ''}
                  </option>
                ))}
              </select>
              {errors.idColaborador && (
                <p className="mt-1 text-sm text-red-600">{errors.idColaborador}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="tipoAso"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Tipo de ASO <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipoAso"
                  name="tipoAso"
                  value={formData.tipoAso}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {tipoOptions.map(option => (
                    <option key={option} value={option}>
                      {getTipoLabel(option)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
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
                <label
                  htmlFor="dataSolicitacao"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Data de Solicitação <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dataSolicitacao"
                  name="dataSolicitacao"
                  value={formData.dataSolicitacao}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.dataSolicitacao ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.dataSolicitacao && (
                  <p className="mt-1 text-sm text-red-600">{errors.dataSolicitacao}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dataValidade"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Data de Validade <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dataValidade"
                  name="dataValidade"
                  value={formData.dataValidade}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.dataValidade ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.dataValidade && (
                  <p className="mt-1 text-sm text-red-600">{errors.dataValidade}</p>
                )}
              </div>
            </div>

            {/* <div>
              <label
                htmlFor="pathFile"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Caminho do Arquivo
              </label>
              <input
                type="text"
                id="pathFile"
                name="pathFile"
                value={formData.pathFile ?? ''}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div> */}

            <div>
              <label
                htmlFor="observacoes"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes ?? ''}
                onChange={handleChange}
                rows={4}
                placeholder="Detalhes adicionais sobre a ASO (opcional)"
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
                {aso ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

