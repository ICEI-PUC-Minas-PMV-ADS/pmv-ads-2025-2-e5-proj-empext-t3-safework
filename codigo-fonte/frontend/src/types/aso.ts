export enum TipoAso {
  Admissional = 1,
  Periodico = 2,
  RetornoAoTrabalho = 3,
  MudancaDeFuncao = 4,
  Demissional = 5
}

export enum StatusAso {
  Valido = 1,
  Vencido = 2,
  Aguardando = 3,
  Cancelado = 4
}

export interface Aso {
  id: number
  tipoAso: TipoAso
  dataSolicitacao: string
  dataValidade: string
  status: StatusAso
  pathFile?: string | null
  observacoes?: string | null
  idColaborador: number
}

export interface AsoFormValues {
  tipoAso: TipoAso
  dataSolicitacao: string
  dataValidade: string
  status: StatusAso
  pathFile?: string
  observacoes?: string
  idColaborador: number
}

