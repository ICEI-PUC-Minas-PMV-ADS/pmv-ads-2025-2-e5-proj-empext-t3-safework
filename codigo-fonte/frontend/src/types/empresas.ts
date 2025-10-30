export interface Empresa {
    id: number
    tipoPessoa: number
    cpfCnpj: string
    nomeRazao: string
    nomeFantasia: string
    telefone: string
    celular: string
    email: string
    status: boolean
    idEndereco: number
    endereco: string
    colaboradores: string[]
    contratos: string[]
}

export interface EmpresaFormData {
    tipoPessoa: number
    cpfCnpj: string
    nomeRazao: string
    nomeFantasia: string
    telefone: string
    celular: string
    email: string
    status: boolean
    idEndereco: number
    endereco: string
    colaboradores: string[]
    contratos: string[]
}

