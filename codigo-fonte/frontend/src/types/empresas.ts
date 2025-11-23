export type TipoPessoa = 'Fisica' | 'Juridica'

export interface Empresa {
  id: number
  tipoPessoa: TipoPessoa
  cpfCnpj: string
  nomeRazao: string
  nomeFantasia?: string
  telefone?: string
  celular?: string
  email?: string
  status: boolean
  idEndereco?: number

  // Campos do Contrato
  numeroContrato?: string
  pathFileContrato?: string
  valorContrato?: number
  observacoesContrto?: string
  dataInicioContrto?: string
  dataFimContrato?: string
}

export interface EmpresaFormData {
  tipoPessoa: TipoPessoa
  cpfCnpj: string
  nomeRazao: string
  nomeFantasia?: string
  telefone?: string
  celular?: string
  email?: string
  status: boolean
  idEndereco?: number

  // Campos do Contrato
  numeroContrato?: string
  pathFileContrato?: string
  valorContrato?: number
  observacoesContrto?: string
  dataInicioContrto?: string
  dataFimContrato?: string
}
