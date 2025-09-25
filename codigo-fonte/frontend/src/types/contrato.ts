export enum StatusContrato {
  Ativo = 1,
  Inativo = 2,
  Suspenso = 3
}

export interface Contrato {
  id?: number
  numero: string
  data_inicio: string
  data_fim: string
  status_contrato: StatusContrato
  path_file?: string
  valor: number
  observacoes?: string
  id_empresa_cliente: number
  id_empresa_prestadora: number
  // Propriedades de navegação para exibição
  empresa_cliente?: {
    id: number
    nome_razao: string
    cpf_cnpj: string
  }
  empresa_prestadora?: {
    id: number
    nome_razao: string
    cpf_cnpj: string
  }
}

export interface ContratoFormData {
  numero: string
  data_inicio: string
  data_fim: string
  status_contrato: StatusContrato
  path_file?: string
  valor: string // String para facilitar formatação de moeda
  observacoes?: string
  id_empresa_cliente: number
  id_empresa_prestadora: number
}