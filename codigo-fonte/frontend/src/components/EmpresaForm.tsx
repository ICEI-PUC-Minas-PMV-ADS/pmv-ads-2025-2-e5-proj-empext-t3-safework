'use client'

import { useEffect, useState } from 'react'
import { Empresa, EmpresaFormData, TipoPessoa } from '@/types/empresas'
import { Endereco, EnderecoFormData } from '@/types/endereco'
import { EnderecoForm } from '@/components/EnderecoForm'
import { apiEnderecos } from '@/lib/api_enderecos'

interface EmpresaFormProps {
  empresa?: Empresa | null
  onSave: (data: EmpresaFormData) => void
  onCancel: () => void
}

const TIPO_PESSOA_OPTIONS: { value: TipoPessoa; label: string }[] = [
  { value: 'Fisica', label: 'Pessoa Física' },
  { value: 'Juridica', label: 'Pessoa Jurídica' }
]

const cpfCnpjMask = {
  Fisica: '000.000.000-00',
  Juridica: '00.000.000/0000-00'
}

export function EmpresaForm({ empresa, onSave, onCancel }: EmpresaFormProps) {

  const [formData, setFormData] = useState<EmpresaFormData>({
    tipoPessoa: 'Fisica',
    cpfCnpj: '',
    nomeRazao: '',
    nomeFantasia: '',
    telefone: '',
    celular: '',
    email: '',
    status: true,
    idEndereco: undefined
  })

  const [enderecos, setEnderecos] = useState<{ id: number; logradouro: string; numero: string }[]>([])
  const [loadingEnderecos, setLoadingEnderecos] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showEnderecoModal, setShowEnderecoModal] = useState(false)
  const [savingEndereco, setSavingEndereco] = useState(false)

  // Busca endereços da API
  useEffect(() => {
    const fetchEnderecos = async () => {
      try {
        const res = await apiEnderecos.getEnderecos()
        setEnderecos(res)
      } catch (error) {
        console.error('Erro ao buscar endereços:', error)
      } finally {
        setLoadingEnderecos(false)
      }
    }

    fetchEnderecos()
  }, [])

  // Preenche formulário ao editar
  useEffect(() => {
    if (empresa) {
      setFormData({
        tipoPessoa: empresa.tipoPessoa,
        cpfCnpj: empresa.cpfCnpj,
        nomeRazao: empresa.nomeRazao,
        nomeFantasia: empresa.nomeFantasia ?? '',
        telefone: empresa.telefone ?? '',
        celular: empresa.celular ?? '',
        email: empresa.email ?? '',
        status: empresa.status,
        idEndereco: empresa.idEndereco
      })
    }
  }, [empresa])

  const formatCpfCnpj = (value: string, tipoPessoa: TipoPessoa) => {
    const numbers = value.replace(/\D/g, '')

    if (tipoPessoa === 'Fisica') {
      if (numbers.length <= 11) {
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, p1, p2, p3, p4) =>
          [p1, p2, p3, p4 ? `-${p4}` : ''].filter(Boolean).join('.').replace('.-', '-')
        )
      }
      return numbers.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }

    if (numbers.length <= 14) {
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
        (_, p1, p2, p3, p4, p5) =>
          `${p1}.${p2}.${p3}/${p4}${p5 ? `-${p5}` : ''}`
      )
    }

    return numbers
      .slice(0, 14)
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type } = event.target
    const value =
      type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : event.target.value

    setFormData(prev => {
      if (name === 'tipoPessoa') {
        const typedValue = value as TipoPessoa
        return {
          ...prev,
          tipoPessoa: typedValue,
          cpfCnpj: formatCpfCnpj(prev.cpfCnpj, typedValue)
        }
      }

      return {
        ...prev,
        [name]: value
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
      setErrors(prev => ({
        ...prev,
        cpfCnpj: ''
      }))
    }
  }

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório'
    }

    if (!formData.nomeRazao.trim()) {
      newErrors.nomeRazao = formData.tipoPessoa === 'Fisica'
        ? 'Nome completo é obrigatório'
        : 'Razão social é obrigatória'
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    onSave({
      ...formData,
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, '')
    })
  }

  const cpfCnpjLabel =
    formData.tipoPessoa === 'Fisica' ? 'CPF' : 'CNPJ'

  const handleEnderecoCriado = async (enderecoData: EnderecoFormData) => {
    try {
      setSavingEndereco(true)

      const novoEndereco = await apiEnderecos.createEndereco(enderecoData as Endereco)

      setEnderecos((prev) => [...prev, novoEndereco])

      setFormData((prev) => ({
        ...prev,
        idEndereco: novoEndereco.id
      }))

      setShowEnderecoModal(false)
    } catch (error) {
      console.error('Erro ao criar endereço a partir do formulário de Empresa:', error)
    } finally {
      setSavingEndereco(false)
    }
  }

  const handleCancelarEndereco = () => {
    setShowEnderecoModal(false)
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {empresa ? 'Editar Empresa' : 'Nova Empresa'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="tipoPessoa"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Tipo de Pessoa *
              </label>
              <select
                id="tipoPessoa"
                name="tipoPessoa"
                value={formData.tipoPessoa}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                {cpfCnpjLabel} *
              </label>
              <input
                type="text"
                id="cpfCnpj"
                name="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={handleCpfCnpjChange}
                maxLength={cpfCnpjMask[formData.tipoPessoa].length}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${errors.cpfCnpj ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder={cpfCnpjMask[formData.tipoPessoa]}
              />
              {errors.cpfCnpj && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.cpfCnpj}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="nomeRazao"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                {formData.tipoPessoa === 'Fisica'
                  ? 'Nome Completo'
                  : 'Razão Social'}{' '}
                *
              </label>
              <input
                type="text"
                id="nomeRazao"
                name="nomeRazao"
                value={formData.nomeRazao}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${errors.nomeRazao ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder={
                  formData.tipoPessoa === 'Fisica'
                    ? 'Digite o nome completo'
                    : 'Digite a razão social'
                }
              />
              {errors.nomeRazao && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.nomeRazao}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="nomeFantasia"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Nome Fantasia
              </label>
              <input
                type="text"
                id="nomeFantasia"
                name="nomeFantasia"
                value={formData.nomeFantasia ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                placeholder="Digite o nome fantasia"
              />
            </div>

            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label
                htmlFor="celular"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Celular
              </label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email ?? ''}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="exemplo@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Endereço */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="idEndereco"
                  className="text-sm font-medium text-gray-900"
                >
                  Endereço *
                </label>

                <button
                  type="button"
                  onClick={() => setShowEnderecoModal(true)}
                  className='text-xs sm:text-sm text-blue-600 hover:underline'
                >
                  + Cadastrar endereço
                </button>
              </div>

              {loadingEnderecos ? (
                <p className="text-sm text-gray-500">Carregando endereços...</p>
              ) : (
                <select
                  id="idEndereco"
                  name="idEndereco"
                  value={formData.idEndereco ?? ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Selecione um endereço</option>
                  {enderecos.map((endereco) => (
                    <option key={endereco.id} value={endereco.id}>
                      {endereco.logradouro} {endereco.numero ? `, ${endereco.numero}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {errors.idEndereco && (
                <p className="mt-1 text-sm text-red-600">{errors.idEndereco}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="status"
                className="ml-2 block text-sm text-gray-900"
              >
                Empresa ativa
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {empresa ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      {showEnderecoModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4'>
            <EnderecoForm
              endereco={null}
              onSave={handleEnderecoCriado}
              onCancel={handleCancelarEndereco}
            />
          </div>
        </div>
      )}
    </>
  )
}