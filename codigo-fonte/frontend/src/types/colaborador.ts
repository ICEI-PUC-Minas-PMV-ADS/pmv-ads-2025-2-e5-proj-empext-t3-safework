import { TipoPessoa } from './empresas'

export interface EnderecoResumo {
  id: number
  logradouro: string
  numero: string
  complemento?: string | null
  bairro: string
  municipio: string
  uf: string
  cep: string
}

export interface Colaborador {
  id: number
  tipoPessoa: TipoPessoa
  cpfCnpj: string
  nomeRazao: string
  nomeFantasia?: string
  telefone?: string
  celular?: string
  email?: string
  status: boolean
  idEndereco?: number | null
  funcao: string
  idEmpresaCliente: number
  empresaClienteNome?: string
  endereco?: EnderecoResumo | null
}

export interface ColaboradorFormValues {
  tipoPessoa: TipoPessoa
  cpfCnpj: string
  nomeRazao: string
  nomeFantasia?: string
  telefone?: string
  celular?: string
  email?: string
  status: boolean
  idEndereco?: number | null
  funcao: string
  idEmpresaCliente: number
}
