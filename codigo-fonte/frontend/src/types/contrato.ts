export enum StatusContrato {
  Ativo = 1,
  Inativo = 2,
  Suspenso = 3
}

export interface EmpresaContratoResumo {
  id: number
  nomeRazao: string
  cpfCnpj: string
}

export interface Contrato {
  id: number
  numero: string
  dataInicio: string
  dataFim: string
  statusContrato: StatusContrato
  pathFile?: string | null
  valor: number
  observacoes?: string | null
  idEmpresaCliente: number
  idEmpresaPrestadora: number
  empresaCliente?: EmpresaContratoResumo
  empresaPrestadora?: EmpresaContratoResumo
}

export interface ContratoFormValues {
  numero: string
  dataInicio: string
  dataFim: string
  statusContrato: StatusContrato
  pathFile?: string
  valor: string
  observacoes?: string
  idEmpresaCliente: number
  idEmpresaPrestadora: number
}