export interface Usuario {
  id: number
  nomeCompleto: string
  email: string
  idPerfil: number
  idEmpresaPrestadora?: number | null
}

export interface UsuarioFormValues {
  nomeCompleto: string
  email: string
  senha?: string
  idPerfil: number
}

