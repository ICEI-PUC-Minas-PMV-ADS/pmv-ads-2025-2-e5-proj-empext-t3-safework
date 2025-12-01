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
    tipoPessoa: 'Juridica',
    cpfCnpj: '',
    nomeRazao: '',
    nomeFantasia: '',
    telefone: '',
    celular: '',
    email: '',
    status: true,
    idEndereco: undefined,
    numeroContrato: '',
    pathFileContrato: '',
    valorContrato: 0,
    observacoesContrato: '',
    dataInicioContrato: '',
    dataFimContrato: ''
  })

  const [enderecos, setEnderecos] = useState<{ id: number; logradouro: string; numero: string }[]>([])
  const [loadingEnderecos, setLoadingEnderecos] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showEnderecoModal, setShowEnderecoModal] = useState(false)
  const [savingEndereco, setSavingEndereco] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
        idEndereco: empresa.idEndereco,
        numeroContrato: empresa.numeroContrato ?? '',
        pathFileContrato: empresa.pathFileContrato ?? '',
        valorContrato: empresa.valorContrato ?? 0,
        dataInicioContrato: empresa.dataInicioContrato
          ? empresa.dataInicioContrato.split('T')[0]
          : '',
        dataFimContrato: empresa.dataFimContrato
          ? empresa.dataFimContrato.split('T')[0]
          : ''
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

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseFloat(numbers) / 100
    return amount.toFixed(2)
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

      if (name === 'valorContrato' && typeof value === 'string') {
        return {
          ...prev,
          valorContrato: parseFloat(value) || 0
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

  const handleValorContratoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(event.target.value)
    setFormData(prev => ({
      ...prev,
      valorContrato: parseFloat(formatted)
    }))
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

    if (!formData.dataInicioContrato) {
      newErrors.dataInicioContrto = 'Data de início do contrato é obrigatória'
    }

    if (!formData.dataFimContrato) {
      newErrors.dataFimContrato = 'Data de fim do contrato é obrigatória'
    }

    if (formData.dataInicioContrato && formData.dataFimContrato) {
      const dataInicio = new Date(formData.dataInicioContrato)
      const dataFim = new Date(formData.dataFimContrato)

      if (dataFim <= dataInicio) {
        newErrors.dataFimContrato = 'Data de fim deve ser posterior à data de início'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFileToBlob = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Ajuste a URL da sua API de upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo')
      }

      const data = await response.json()
      return data.url // URL do blob retornada pela API
    } catch (error) {
      console.error('Erro no upload:', error)
      throw error
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      let blobUrl = formData.pathFileContrato

      // Se houver um arquivo selecionado, faz o upload
      if (selectedFile) {
        blobUrl = await uploadFileToBlob(selectedFile)
      }

      // Prepara os dados para envio
      const dataToSend: EmpresaFormData = {
        tipoPessoa: formData.tipoPessoa,
        cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
        nomeRazao: formData.nomeRazao,
        nomeFantasia: formData.nomeFantasia || undefined,
        telefone: formData.telefone || undefined,
        celular: formData.celular || undefined,
        email: formData.email,
        status: formData.status,
        idEndereco: formData.idEndereco || undefined,

        // Dados do contrato
        numeroContrato: formData.numeroContrato || '',
        pathFileContrato: blobUrl || '',
        valorContrato: Number(formData.valorContrato) || 0,
        observacoesContrato: formData.observacoesContrato || '',

        // Datas no formato ISO 8601 completo
        dataInicioContrato: formData.dataInicioContrato
          ? new Date(formData.dataInicioContrato + 'T00:00:00').toISOString()
          : new Date().toISOString(),

        dataFimContrato: formData.dataFimContrato
          ? new Date(formData.dataFimContrato + 'T23:59:59').toISOString()
          : new Date().toISOString()
      }

      console.log('Dados sendo enviados:', dataToSend) // Para debug

      onSave(dataToSend)
    } catch (error) {
      console.error('Erro ao processar formulário:', error)
      alert('Erro ao processar o formulário. Tente novamente.')
    }
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

  // Handlers para upload de arquivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setFormData(prev => ({
        ...prev,
        pathFileContrato: file.name
      }))
      if (errors.pathFileContrato) {
        setErrors(prev => ({ ...prev, pathFileContrato: '' }))
      }
    } else {
      alert('Por favor, selecione apenas arquivos PDF')
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setFormData(prev => ({
        ...prev,
        pathFileContrato: file.name
      }))
      if (errors.pathFileContrato) {
        setErrors(prev => ({ ...prev, pathFileContrato: '' }))
      }
    } else {
      alert('Por favor, selecione apenas arquivos PDF')
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFormData(prev => ({
      ...prev,
      pathFileContrato: ''
    }))
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {empresa ? 'Editar Empresa' : 'Nova Empresa'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção: Dados da Empresa */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Dados da Empresa
            </h3>
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

              {formData.tipoPessoa === 'Juridica' && (
                <div>
                  <label
                    htmlFor="nomeRazao"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    id="nomeRazao"
                    name="nomeRazao"
                    value={formData.nomeRazao}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${errors.nomeRazao ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Digite a razão social"
                  />
                  {errors.nomeRazao && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nomeRazao}
                    </p>
                  )}
                </div>
              )}

              {formData.tipoPessoa === 'Fisica' && (
                <div>
                  <label
                    htmlFor="nomeRazao"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nomeRazao"
                    name="nomeRazao"
                    value={formData.nomeRazao}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${errors.nomeRazao ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Digite o nome completo"
                  />
                  {errors.nomeRazao && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nomeRazao}
                    </p>
                  )}
                </div>
              )}

              {formData.tipoPessoa === 'Juridica' && (
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
              )}

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

              <div>
                <label htmlFor="idEndereco" className="block text-sm font-medium text-gray-900 mb-2">
                  Endereço *
                </label>
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
                        {endereco.logradouro}
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
          </div>

          {/* Seção: Dados do Contrato */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Dados do Contrato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="numeroContrato"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Número do Contrato
                </label>
                <input
                  type="text"
                  id="numeroContrato"
                  name="numeroContrato"
                  value={formData.numeroContrato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                  placeholder="Digite o número do contrato"
                />
              </div>

              {/* <div>
                <label
                  htmlFor="pathFileContrato"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Arquivo do Contrato (PDF)
                </label>

                Área de Drag and Drop 
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <input
                    type="file"
                    id="pathFileContrato"
                    name="pathFileContrato"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-8 h-8 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        Arraste o arquivo PDF aqui ou{' '}
                        <label
                          htmlFor="pathFileContrato"
                          className="text-blue-600 hover:text-blue-500 cursor-pointer font-medium"
                        >
                          clique para selecionar
                        </label>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Apenas arquivos PDF
                      </p>
                    </div>
                  )}
                </div>
                {errors.pathFileContrato && (
                  <p className="mt-1 text-sm text-red-600">{errors.pathFileContrato}</p>
                )}
              </div> */}

              <div>
                <label
                  htmlFor="valorContrato"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Valor do Contrato (R$)
                </label>
                <input
                  type="number"
                  id="valorContrato"
                  name="valorContrato"
                  value={formData.valorContrato}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label
                  htmlFor="dataInicioContrato"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Data de Início *
                </label>
                <input
                  type="date"
                  id="dataInicioContrato"
                  name="dataInicioContrato"
                  value={formData.dataInicioContrato}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.dataInicioContrato ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.dataInicioContrato && (
                  <p className="mt-1 text-sm text-red-600">{errors.dataInicioContrato}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dataFimContrato"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Data de Fim *
                </label>
                <input
                  type="date"
                  id="dataFimContrato"
                  name="dataFimContrato"
                  value={formData.dataFimContrato}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.dataFimContrato ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.dataFimContrato && (
                  <p className="mt-1 text-sm text-red-600">{errors.dataFimContrato}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="observacoesContrato"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Observações do Contrato
                </label>
                <textarea
                  id="observacoesContrato"
                  name="observacoesContrato"
                  value={formData.observacoesContrato}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                  placeholder="Digite observações sobre o contrato..."
                />
              </div>
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