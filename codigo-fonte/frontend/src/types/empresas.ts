export interface Empresa {
    id: number
    tipoPessoa: 'Fisica' | 'Juridica'
    cpfCnpj: string
    nomeRazao: string
    nomeFantasia?: string
    telefone?: string
    celular?: string
    email?: string
    status: boolean
    idEndereco: string | null
}

export interface EmpresaFormData {
    tipoPessoa: 'Fisica' | 'Juridica'
    cpfCnpj: string
    nomeRazao: string
    nomeFantasia?: string
    telefone?: string
    celular?: string
    email?: string
    status: boolean
    idEndereco: string | null
    // colaboradores: string[]
    // contratos: string[]
}

