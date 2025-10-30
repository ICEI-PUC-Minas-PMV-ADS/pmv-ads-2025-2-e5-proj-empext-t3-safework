'use client'

import { useState, useEffect } from 'react'
import { Colaborador, ColaboradorFormData, TipoDocumentoColaborador } from '../types/colaborador'
import { apiEmpresas } from '@/lib/api_empresas'

interface ColaboradorFormProps {
  colaborador?: Colaborador | null
  onSave: (colaborador: ColaboradorFormData) => void
  onCancel: () => void
}

export default function ColaboradorForm({ colaborador, onSave, onCancel }: ColaboradorFormProps) {
  const [formData, setFormData] = useState<ColaboradorFormData>({
    // Dados pessoais
    nome_razao: '',
    cpf_cnpj: '',
    data_nascimento: '',
    telefone: '',
    celular: '',
    email: '',

    // Dados profissionais
    funcao: '',
    id_empresa_cliente: 0,

    // Dados de saúde
    tipo_sanguineo: '',
    alergias: '',
    medicamentos_uso_continuo: '',
    historico_doencas: '',
    observacoes_medicas: '',

    // Endereço
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },

    // Status
    status: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Request para empresas
  const empresasClientes = async () => apiEmpresas.getEmpresas()

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome_razao: colaborador.nome_razao || '',
        cpf_cnpj: colaborador.cpf_cnpj || '',
        data_nascimento: colaborador.data_nascimento || '',
        telefone: colaborador.telefone || '',
        celular: colaborador.celular || '',
        email: colaborador.email || '',
        funcao: colaborador.funcao || '',
        id_empresa_cliente: colaborador.id_empresa_cliente || 1,
        tipo_sanguineo: colaborador.tipo_sanguineo || '',
        alergias: colaborador.alergias || '',
        medicamentos_uso_continuo: colaborador.medicamentos_uso_continuo || '',
        historico_doencas: colaborador.historico_doencas || '',
        observacoes_medicas: colaborador.observacoes_medicas || '',
        endereco: {
          logradouro: colaborador.endereco?.logradouro || '',
          numero: colaborador.endereco?.numero || '',
          complemento: colaborador.endereco?.complemento || '',
          bairro: colaborador.endereco?.bairro || '',
          cidade: colaborador.endereco?.cidade || '',
          estado: colaborador.endereco?.estado || '',
          cep: colaborador.endereco?.cep || ''
        },
        status: colaborador.status ?? true
      })
    }
  }, [colaborador])

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '')
    if (cleanCPF.length !== 11) return false

    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false

    return true
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validações obrigatórias
    if (!formData.nome_razao.trim()) {
      newErrors.nome_razao = 'Nome completo é obrigatório'
    }

    if (!formData.cpf_cnpj.trim()) {
      newErrors.cpf_cnpj = 'CPF é obrigatório'
    } else if (!validateCPF(formData.cpf_cnpj)) {
      newErrors.cpf_cnpj = 'CPF inválido'
    }

    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória'
    }

    if (!formData.funcao.trim()) {
      newErrors.funcao = 'Função é obrigatória'
    }

    if (!formData.id_empresa_cliente) {
      newErrors.id_empresa_cliente = 'Empresa cliente é obrigatória'
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value
      }
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatCEP = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
        </h1>
        <p className="text-gray-600">
          {colaborador ? 'Atualize as informações do colaborador' : 'Cadastre um novo colaborador no sistema'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados Pessoais */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados Pessoais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome_razao}
                onChange={(e) => handleInputChange('nome_razao', e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nome_razao ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Digite o nome completo"
              />
              {errors.nome_razao && (
                <p className="mt-1 text-sm text-red-600">{errors.nome_razao}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                value={formatCPF(formData.cpf_cnpj)}
                onChange={(e) => handleInputChange('cpf_cnpj', e.target.value.replace(/\D/g, ''))}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cpf_cnpj ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf_cnpj && (
                <p className="mt-1 text-sm text-red-600">{errors.cpf_cnpj}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.data_nascimento ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.data_nascimento && (
                <p className="mt-1 text-sm text-red-600">{errors.data_nascimento}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Celular
              </label>
              <input
                type="tel"
                value={formData.celular}
                onChange={(e) => handleInputChange('celular', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados Profissionais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa Cliente *
              </label>
              <select
                value={formData.id_empresa_cliente}
                onChange={(e) => handleInputChange('id_empresa_cliente', parseInt(e.target.value))}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.id_empresa_cliente ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value={0}>Selecione uma empresa</option>
                {empresasClientes.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome_razao}
                  </option>
                ))}
              </select>
              {errors.id_empresa_cliente && (
                <p className="mt-1 text-sm text-red-600">{errors.id_empresa_cliente}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função *
              </label>
              <input
                type="text"
                value={formData.funcao}
                onChange={(e) => handleInputChange('funcao', e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.funcao ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Ex: Analista, Operador, Técnico"
              />
              {errors.funcao && (
                <p className="mt-1 text-sm text-red-600">{errors.funcao}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status ? '1' : '0'}
                onChange={(e) => handleInputChange('status', e.target.value === '1')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dados de Saúde */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados de Saúde (para ASO)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Sanguíneo
              </label>
              <select
                value={formData.tipo_sanguineo}
                onChange={(e) => handleInputChange('tipo_sanguineo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o tipo sanguíneo</option>
                {tiposSanguineos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alergias
              </label>
              <textarea
                value={formData.alergias}
                onChange={(e) => handleInputChange('alergias', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descreva alergias conhecidas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicamentos de Uso Contínuo
              </label>
              <textarea
                value={formData.medicamentos_uso_continuo}
                onChange={(e) => handleInputChange('medicamentos_uso_continuo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Liste medicamentos em uso contínuo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Histórico de Doenças
              </label>
              <textarea
                value={formData.historico_doencas}
                onChange={(e) => handleInputChange('historico_doencas', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Histórico médico relevante"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Médicas
              </label>
              <textarea
                value={formData.observacoes_medicas}
                onChange={(e) => handleInputChange('observacoes_medicas', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Observações médicas adicionais"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Endereço</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEP
              </label>
              <input
                type="text"
                value={formatCEP(formData.endereco.cep)}
                onChange={(e) => handleEnderecoChange('cep', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logradouro
              </label>
              <input
                type="text"
                value={formData.endereco.logradouro}
                onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </label>
              <input
                type="text"
                value={formData.endereco.numero}
                onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complemento
              </label>
              <input
                type="text"
                value={formData.endereco.complemento}
                onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apto, Sala, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bairro
              </label>
              <input
                type="text"
                value={formData.endereco.bairro}
                onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do bairro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              <input
                type="text"
                value={formData.endereco.cidade}
                onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.endereco.estado}
                onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload de Documentos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Documentos</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload de Documentos
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 5MB por arquivo)
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Arquivos Selecionados:</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {colaborador ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}