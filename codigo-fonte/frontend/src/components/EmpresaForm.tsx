import { apiEnderecos } from '@/lib/api_enderecos'
import { Empresa, EmpresaFormData } from '@/types/empresas'
import { useState, useEffect } from 'react'

interface EmpresaFormProps {
  empresa?: Empresa | null
  onSave: (empresa: EmpresaFormData) => void
  onCancel: () => void
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
    idEndereco: null
  })

  const [enderecos, setEnderecos] = useState<{ id: number; logradouro: string }[]>([])
  const [loadingEnderecos, setLoadingEnderecos] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
        ...empresa,
      })
    }
  }, [empresa])

  // Manipula inputs genéricos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (name === 'id') return

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value) || 0
            : value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Formata CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '')

    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, d) => {
        return d ? `${a}.${b}.${c}-${d}` : `${a}.${b}.${c}`
      })
    } else {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})(\d{0,2})/, (_, a, b, c, d, e) => {
        if (e) return `${a}.${b}.${c}/${d}-${e}`
        if (d) return `${a}.${b}.${c}/${d}`
        return `${a}.${b}.${c}`
      })
    }
  }

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value)
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

    if (!formData.cpfCnpj.trim()) newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório'
    if (!formData.nomeRazao.trim()) newErrors.nomeRazao = 'Nome/Razão Social é obrigatório'
    if (!formData.idEndereco) newErrors.idEndereco = 'Selecione um endereço'

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submissão
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const dataToSave = {
      ...formData,
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
      tipoPessoa: formData.tipoPessoa
    }
    console.log('Dados enviados:', dataToSave)

    onSave(dataToSave)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {empresa ? 'Editar Empresa' : 'Nova Empresa'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Pessoa */}
          <div>
            <label htmlFor="tipoPessoa" className="block text-sm font-medium text-gray-900 mb-2">
              Tipo de Pessoa *
            </label>
            <select
              id="tipoPessoa"
              name="tipoPessoa"
              value={formData.tipoPessoa}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="Fisica">Pessoa Física</option>
              <option value="Juridica">Pessoa Jurídica</option>
            </select>
          </div>

          {/* CPF/CNPJ */}
          <div>
            <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-900 mb-2">
              {formData.tipoPessoa === 'Juridica' ? 'CNPJ' : 'CPF'} *
            </label>
            <input
              type="text"
              id="cpfCnpj"
              name="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={handleCpfCnpjChange}
              maxLength={formData.tipoPessoa === 'Juridica' ? 18 : 14}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${errors.cpfCnpj ? 'border-red-300' : 'border-gray-300'}`}
              placeholder={formData.tipoPessoa === 'Juridica' ? '00.000.000/0000-00' : '000.000.000-00'}
            />
            {errors.cpfCnpj && <p className="mt-1 text-sm text-red-600">{errors.cpfCnpj}</p>}
          </div>

          {/* Nome/Razão Social */}
          <div>
            <label htmlFor="nomeRazao" className="block text-sm font-medium text-gray-900 mb-2">
              {formData.tipoPessoa === 'Juridica' ? 'Razão Social' : 'Nome Completo'} *
            </label>
            <input
              type="text"
              id="nomeRazao"
              name="nomeRazao"
              value={formData.nomeRazao}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${errors.nomeRazao ? 'border-red-300' : 'border-gray-300'}`}
              placeholder={formData.tipoPessoa === 'Juridica' ? 'Digite a razão social' : 'Digite o nome completo'}
            />
            {errors.nomeRazao && <p className="mt-1 text-sm text-red-600">{errors.nomeRazao}</p>}
          </div>

          {/* Nome Fantasia */}
          <div>
            <label htmlFor="nomeFantasia" className="block text-sm font-medium text-gray-900 mb-2">
              Nome Fantasia
            </label>
            <input
              type="text"
              disabled={formData.tipoPessoa !== 'Juridica'}
              id="nomeFantasia"
              name="nomeFantasia"
              value={formData.nomeFantasia || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="Digite o nome fantasia"
            />
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-900 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="(00) 0000-0000"
            />
          </div>

          {/* Celular */}
          <div>
            <label htmlFor="celular" className="block text-sm font-medium text-gray-900 mb-2">
              Celular
            </label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="exemplo@email.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Endereço */}
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
                onChange={handleInputChange}
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

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={formData.status}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
              Empresa ativa
            </label>
          </div>
        </div>

        {/* Botões */}
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
  )
}
