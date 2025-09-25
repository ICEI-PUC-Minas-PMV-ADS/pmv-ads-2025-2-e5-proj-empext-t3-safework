export interface Colaborador {
  id?: number
  funcao: string
  id_empresa_cliente: number
  tipo_pessoa: number // 1 = Pessoa Física, 2 = Pessoa Jurídica
  cpf_cnpj: string
  nome_razao: string
  nome_fantasia?: string
  telefone?: string
  celular?: string
  email?: string
  status: boolean
  id_endereco?: number
  
  // Dados específicos para colaboradores
  data_nascimento?: string
  cargo?: string
  setor?: string
  data_admissao?: string
  
  // Dados de saúde para ASO
  tipo_sanguineo?: string
  alergias?: string
  medicamentos_uso_continuo?: string
  historico_doencas?: string
  observacoes_medicas?: string
  
  // Documentos
  documentos?: ColaboradorDocumento[]
  
  // Relacionamentos
  empresa_cliente?: {
    id: number
    nome_razao: string
    cpf_cnpj: string
  }
  endereco?: {
    id: number
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
}

export interface ColaboradorDocumento {
  id?: number
  id_colaborador: number
  tipo_documento: string
  nome_arquivo: string
  caminho_arquivo: string
  data_upload: string
  tamanho_arquivo: number
}

export enum TipoDocumentoColaborador {
  RG = 'RG',
  CPF = 'CPF',
  CARTEIRA_TRABALHO = 'Carteira de Trabalho',
  COMPROVANTE_RESIDENCIA = 'Comprovante de Residência',
  EXAMES_MEDICOS = 'Exames Médicos',
  ATESTADO_MEDICO = 'Atestado Médico',
  OUTROS = 'Outros'
}

export enum StatusColaborador {
  Ativo = 1,
  Inativo = 0
}

export interface ColaboradorFormData {
  // Dados pessoais
  nome_razao: string
  cpf_cnpj: string
  data_nascimento: string
  telefone: string
  celular: string
  email: string
  
  // Dados profissionais
  funcao: string
  cargo: string
  setor: string
  data_admissao: string
  id_empresa_cliente: number
  
  // Dados de saúde
  tipo_sanguineo: string
  alergias: string
  medicamentos_uso_continuo: string
  historico_doencas: string
  observacoes_medicas: string
  
  // Endereço
  endereco: {
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  
  // Status
  status: boolean
}