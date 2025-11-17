'use client'

import { useEffect, useMemo, useState } from 'react'

import { Colaborador, ColaboradorFormValues } from '@/types/colaborador'
import { Empresa, TipoPessoa } from '@/types/empresas'

interface ColaboradorFormProps {
  colaborador?: Colaborador | null
  empresas: Empresa[]
  onSave: (data: ColaboradorFormValues) => void
  onCancel: () => void
}

const TIPO_PESSOA_OPTIONS: { value: TipoPessoa; label: string }[] = [
  { value: 'Fisica', label: 'Pessoa Física' },
  { value: 'Juridica', label: 'Pessoa Jurídica' }
]

const CPF_MASK = '000.000.000-00'
const CNPJ_MASK = '00.000.000/0000-00'

const DEFAULT_FORM: ColaboradorFormValues = {
  tipoPessoa: 'Fisica',
  cpfCnpj: '',
  nomeRazao: '',
  nomeFantasia: '',
  telefone: '',
  celular: '',
  email: '',
  status: true,
  idEndereco: undefined,
  funcao: '',
  idEmpresaCliente: 0
}

export function ColaboradorForm({
  colaborador,
  empresas,
  onSave,
  onCancel
}: ColaboradorFormProps) {
  const [formData, setFormData] = useState<ColaboradorFormValues>(DEFAULT_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (colaborador) {
      setFormData({
        tipoPessoa: colaborador.tipoPessoa,
        cpfCnpj: colaborador.cpfCnpj,
        nomeRazao: colaborador.nomeRazao,
        nomeFantasia: colaborador.nomeFantasia ?? '',
        telefone: colaborador.telefone ?? '',
        celular: colaborador.celular ?? '',
        email: colaborador.email ?? '',
        status: colaborador.status,
        idEndereco: colaborador.idEndereco ?? undefined,
        funcao: colaborador.funcao,
        idEmpresaCliente: colaborador.idEmpresaCliente
      })
    } else {
      setFormData(DEFAULT_FORM)
    }
  }, [colaborador])

  const empresasOptions = useMemo(
    () =>
      empresas
        .slice()
        .sort((a, b) => a.nomeRazao.localeCompare(b.nomeRazao)),
    [empresas]
  )

  const formatCpfCnpj = (value: string, tipo: TipoPessoa) => {
    const numbers = value.replace(/\D/g, '')

    if (tipo === 'Fisica') {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, p1, p2, p3, p4) =>
          [p1, p2, p3, p4 ? `-${p4}` : '']
            .filter(Boolean)
            .join('.')
            .replace('.-', '-')
        )
    }

    return numbers
      .slice(0, 14)
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) =>
        `${p1}.${p2}.${p3}/${p4}${p5 ? `-${p5}` : ''}`
      )
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target
    const parsedValue =
      type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : value

    setFormData(prev => {
      if (name === 'tipoPessoa') {
        const tipo = parsedValue as TipoPessoa
        return {
          ...prev,
          tipoPessoa: tipo,
          cpfCnpj: formatCpfCnpj(prev.cpfCnpj, tipo)
        }
      }

      if (name === 'idEmpresaCliente') {
        return { ...prev, idEmpresaCliente: Number(parsedValue) }
      }

      if (name === 'idEndereco') {
        return { ...prev, idEndereco: parsedValue ? Number(parsedValue) : undefined }
      }

      return {
        ...prev,
        [name]: parsedValue
      }
    })

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCpfCnpjChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(event.target.value, formData.tipoPessoa)
    setFormData(prev => ({
      ...prev,
      cpfCnpj: formatted
    }))

    if (errors.cpfCnpj) {
      setErrors(prev => ({ ...prev, cpfCnpj: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nomeRazao.trim()) {
      newErrors.nomeRazao =
        formData.tipoPessoa === 'Fisica'
          ? 'Nome completo é obrigatório'
          : 'Razão social é obrigatória'
    }

    if (!formData.cpfCnpj.replace(/\D/g, '')) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório'
    }

    if (!formData.funcao.trim()) {
      newErrors.funcao = 'Função é obrigatória'
    }

    if (!formData.idEmpresaCliente) {
      newErrors.idEmpresaCliente = 'Selecione a empresa do colaborador'
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    onSave({
      ...formData,
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
      nomeRazao: formData.nomeRazao.trim(),
      funcao: formData.funcao.trim(),
      nomeFantasia: formData.nomeFantasia?.trim() || undefined,
      telefone: formData.telefone?.trim() || undefined,
      celular: formData.celular?.trim() || undefined,
      email: formData.email?.trim() || undefined
    })
  }

  const cpfCnpjLabel = formData.tipoPessoa === 'Fisica' ? 'CPF' : 'CNPJ'

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="tipoPessoa"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Tipo de Pessoa *
            </label>
            <select
              id="tipoPessoa"
              name="tipoPessoa"
              value={formData.tipoPessoa}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {TIPO_PESSOA_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="cpfCnpj"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              {cpfCnpjLabel} *
            </label>
            <input
              id="cpfCnpj"
              name="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={handleCpfCnpjChange}
              maxLength={
                formData.tipoPessoa === 'Fisica'
                  ? CPF_MASK.length
                  : CNPJ_MASK.length
              }
              placeholder={
                formData.tipoPessoa === 'Fisica' ? CPF_MASK : CNPJ_MASK
              }
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.cpfCnpj ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.cpfCnpj && (
              <p className="mt-1 text-sm text-red-600">{errors.cpfCnpj}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="nomeRazao"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              {formData.tipoPessoa === 'Fisica'
                ? 'Nome Completo'
                : 'Razão Social'}{' '}
              *
            </label>
            <input
              id="nomeRazao"
              name="nomeRazao"
              value={formData.nomeRazao}
              onChange={handleChange}
              placeholder={
                formData.tipoPessoa === 'Fisica'
                  ? 'Digite o nome completo'
                  : 'Digite a razão social'
              }
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.nomeRazao ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.nomeRazao && (
              <p className="mt-1 text-sm text-red-600">{errors.nomeRazao}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="nomeFantasia"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Nome Fantasia
            </label>
            <input
              id="nomeFantasia"
              name="nomeFantasia"
              value={formData.nomeFantasia ?? ''}
              onChange={handleChange}
              placeholder="Digite o nome fantasia"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="funcao"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Função *
            </label>
            <input
              id="funcao"
              name="funcao"
              value={formData.funcao}
              onChange={handleChange}
              placeholder="Informe a função"
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.funcao ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.funcao && (
              <p className="mt-1 text-sm text-red-600">{errors.funcao}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="idEmpresaCliente"
              className="mb-2 block text-sm font-medium text-gray-900"
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
              <option value={0}>Selecione uma empresa</option>
              {empresasOptions.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nomeRazao}
                </option>
              ))}
            </select>
            {errors.idEmpresaCliente && (
              <p className="mt-1 text-sm text-red-600">
                {errors.idEmpresaCliente}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="telefone"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Telefone
            </label>
            <input
              id="telefone"
              name="telefone"
              value={formData.telefone ?? ''}
              onChange={handleChange}
              placeholder="(00) 0000-0000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="celular"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Celular
            </label>
            <input
              id="celular"
              name="celular"
              value={formData.celular ?? ''}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              value={formData.email ?? ''}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              className={`w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="idEndereco"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              ID do Endereço (opcional)
            </label>
            <input
              id="idEndereco"
              name="idEndereco"
              value={formData.idEndereco ?? ''}
              onChange={handleChange}
              placeholder="Informe o ID ou deixe em branco"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              id="status"
              name="status"
              type="checkbox"
              checked={formData.status}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="status" className="ml-2 text-sm text-gray-900">
              Colaborador ativo
            </label>
          </div>
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
            {colaborador ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}

