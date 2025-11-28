import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { Empresa, EmpresaFormData } from '@/types/empresas'
import { Usuario, UsuarioFormValues } from '@/types/usuario'
import { Colaborador, ColaboradorFormValues } from '@/types/colaborador'
import { Aso, AsoFormValues } from '@/types/aso'
import { Contrato, StatusContrato } from '@/types/contrato'

type ContratoPayload = {
  numero: string
  dataInicio: string
  dataFim: string
  statusContrato: StatusContrato
  pathFile?: string | null
  valor: number
  observacoes?: string | null
  idEmpresaCliente: number
  idEmpresaPrestadora: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5219/api'

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  jwtToken: string
  usuario: User
}

export interface User {
  id: number
  nomeCompleto: string
  email: string
  idPerfil: number
  idEmpresaPrestadora?: number
}

class ApiClient {
  private axiosInstance: AxiosInstance
  private token: string | null = null

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      console.log("TOKEN ENCONTRADO PARA API" + this.token)
      if (this.token) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    }

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error: any) => {
        return Promise.reject(error)
      }
    )

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const isLoginRequest = error.config?.url?.includes('/Login') && error.config?.method === 'post'

          if (isLoginRequest) {
            const backendMessage = (error.response?.data as any)?.message
            throw new Error(backendMessage || 'Email ou senha incorretos. Verifique suas credenciais.')
          } else {
            this.setToken(null)
            throw new Error('Sessão expirada. Faça login novamente.')
          }
        }

        const errorMessage = (error.response?.data as any)?.message ||
          `Erro ${error.response?.status}: ${error.response?.statusText}` ||
          'Erro de conexão com o servidor'

        throw new Error(errorMessage)
      }
    )
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('auth_token')
        delete this.axiosInstance.defaults.headers.common['Authorization']
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.axiosInstance.post<LoginResponse>('/Login', credentials)
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.axiosInstance.get<User>('/Login/me')
    return response.data
  }

  async getUsers(): Promise<User[]> {
    const response = await this.axiosInstance.get<User[]>('/Usuario')
    return response.data
  }

  async getUsuarios(): Promise<Usuario[]> {
    const response = await this.axiosInstance.get<Usuario[]>('/Usuario')
    return response.data
  }

  async createUsuario(data: UsuarioFormValues): Promise<Usuario> {
    const response = await this.axiosInstance.post<Usuario>('/Usuario', {
      nomeCompleto: data.nomeCompleto,
      email: data.email,
      senha: data.senha,
      idPerfil: data.idPerfil
    })

    return response.data
  }

  async updateUsuario(id: number, data: UsuarioFormValues): Promise<Usuario> {
    const response = await this.axiosInstance.put<Usuario>(`/Usuario/${id}`, {
      nomeCompleto: data.nomeCompleto,
      email: data.email,
      senha: data.senha ?? null,
      idPerfil: data.idPerfil
    })

    return response.data
  }

  async deleteUsuario(id: number): Promise<void> {
    await this.axiosInstance.delete(`/Usuario/${id}`)
  }

  async getColaboradores(): Promise<Colaborador[]> {
    const response = await this.axiosInstance.get<Colaborador[]>('/Colaboradores')
    return response.data
  }

  async createColaborador(data: ColaboradorFormValues): Promise<Colaborador> {
    const response = await this.axiosInstance.post<Colaborador>('/Colaboradores', {
      tipoPessoa: data.tipoPessoa,
      cpfCnpj: data.cpfCnpj,
      nomeRazao: data.nomeRazao,
      nomeFantasia: data.nomeFantasia || null,
      telefone: data.telefone || null,
      celular: data.celular || null,
      email: data.email || null,
      status: data.status,
      idEndereco: data.idEndereco ?? null,
      funcao: data.funcao,
      idEmpresaCliente: data.idEmpresaCliente
    })

    return response.data
  }

  async updateColaborador(id: number, data: ColaboradorFormValues): Promise<Colaborador> {
    const response = await this.axiosInstance.put<Colaborador>(`/Colaboradores/${id}`, {
      id,
      tipoPessoa: data.tipoPessoa,
      cpfCnpj: data.cpfCnpj,
      nomeRazao: data.nomeRazao,
      nomeFantasia: data.nomeFantasia || null,
      telefone: data.telefone || null,
      celular: data.celular || null,
      email: data.email || null,
      status: data.status,
      idEndereco: data.idEndereco ?? null,
      funcao: data.funcao,
      idEmpresaCliente: data.idEmpresaCliente
    })

    return response.data
  }

  async deleteColaborador(id: number): Promise<void> {
    await this.axiosInstance.delete(`/Colaboradores/${id}`)
  }

  async getAsos(): Promise<Aso[]> {
    const response = await this.axiosInstance.get<Aso[]>('/Aso')
    return response.data
  }

  async createAso(data: AsoFormValues): Promise<Aso> {
    const response = await this.axiosInstance.post<Aso>('/Aso', {
      tipoAso: data.tipoAso,
      dataSolicitacao: data.dataSolicitacao,
      dataValidade: data.dataValidade,
      status: data.status,
      pathFile: data.pathFile ?? null,
      observacoes: data.observacoes ?? null,
      idColaborador: data.idColaborador
    })

    return response.data
  }

  async updateAso(id: number, data: AsoFormValues): Promise<Aso> {
    const response = await this.axiosInstance.put<Aso>(`/Aso/${id}`, {
      id,
      tipoAso: data.tipoAso,
      dataSolicitacao: data.dataSolicitacao,
      dataValidade: data.dataValidade,
      status: data.status,
      pathFile: data.pathFile ?? null,
      observacoes: data.observacoes ?? null,
      idColaborador: data.idColaborador
    })

    return response.data
  }

  async deleteAso(id: number): Promise<void> {
    await this.axiosInstance.delete(`/Aso/${id}`)
  }

  async getContratos(): Promise<Contrato[]> {
    const response = await this.axiosInstance.get<Contrato[]>('/Contrato')
    return response.data
  }

  async createContrato(data: ContratoPayload): Promise<Contrato> {
    const response = await this.axiosInstance.post<Contrato>('/Contrato', data)
    return response.data
  }

  async updateContrato(id: number, data: ContratoPayload): Promise<Contrato> {
    const response = await this.axiosInstance.put<Contrato>(`/Contrato/${id}`, {
      id,
      ...data
    })
    return response.data
  }

  async deleteContrato(id: number): Promise<void> {
    await this.axiosInstance.delete(`/Contrato/${id}`)
  }

  async getEmpresas(): Promise<Empresa[]> {
    const response = await this.axiosInstance.get<Empresa[]>('/Empresa')
    return response.data
  }

  async createEmpresa(data: EmpresaFormData): Promise<Empresa> {
    const response = await this.axiosInstance.post<Empresa>('/Empresa', {
      tipoPessoa: data.tipoPessoa,
      cpfCnpj: data.cpfCnpj,
      nomeRazao: data.nomeRazao,
      nomeFantasia: data.nomeFantasia || null,
      telefone: data.telefone || null,
      celular: data.celular || null,
      email: data.email || null,
      status: data.status,
      idEndereco: data.idEndereco ?? null
    })

    return response.data
  }

  async updateEmpresa(id: number, data: EmpresaFormData): Promise<Empresa> {
    const response = await this.axiosInstance.put<Empresa>(`/Empresa/${id}`, {
      id,
      tipoPessoa: data.tipoPessoa,
      cpfCnpj: data.cpfCnpj,
      nomeRazao: data.nomeRazao,
      nomeFantasia: data.nomeFantasia || null,
      telefone: data.telefone || null,
      celular: data.celular || null,
      email: data.email || null,
      status: data.status,
      idEndereco: data.idEndereco ?? null
    })

    return response.data
  }

  async deleteEmpresa(id: number): Promise<void> {
    await this.axiosInstance.delete(`/Empresa/${id}`)
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.axiosInstance.get<User>(`/Usuario/${id}`)
    return response.data
  }

  async recoverPassword(email: string): Promise<void> {
    const axiosInstance = axios.create({
      baseURL: this.axiosInstance.defaults.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await axiosInstance.post<void>(`/Login/recoverPassword?email=${encodeURIComponent(email)}`)
    return response.data
  }

  async resetPassword(email: string, tempPassword: string, newPassword: string): Promise<void> {
    const axiosInstance = axios.create({
      baseURL: this.axiosInstance.defaults.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await axiosInstance.post<void>('/Login/resetPassword', {
      email,
      tempPassword,
      newPassword
    })
    return response.data
  }

  logout() {
    this.setToken(null)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

export const login = (credentials: LoginRequest) => apiClient.login(credentials)
export const logout = () => apiClient.logout()
export const getCurrentUser = () => apiClient.getCurrentUser()
export const isAuthenticated = () => apiClient.isAuthenticated()
export const getEmpresas = () => apiClient.getEmpresas()
export const createEmpresa = (data: EmpresaFormData) => apiClient.createEmpresa(data)
export const updateEmpresa = (id: number, data: EmpresaFormData) => apiClient.updateEmpresa(id, data)
export const deleteEmpresa = (id: number) => apiClient.deleteEmpresa(id)
export const getUsuarios = () => apiClient.getUsuarios()
export const createUsuario = (data: UsuarioFormValues) => apiClient.createUsuario(data)
export const updateUsuario = (id: number, data: UsuarioFormValues) => apiClient.updateUsuario(id, data)
export const deleteUsuario = (id: number) => apiClient.deleteUsuario(id)
export const getColaboradores = () => apiClient.getColaboradores()
export const createColaborador = (data: ColaboradorFormValues) => apiClient.createColaborador(data)
export const updateColaborador = (id: number, data: ColaboradorFormValues) => apiClient.updateColaborador(id, data)
export const deleteColaborador = (id: number) => apiClient.deleteColaborador(id)
export const getAsos = () => apiClient.getAsos()
export const createAso = (data: AsoFormValues) => apiClient.createAso(data)
export const updateAso = (id: number, data: AsoFormValues) => apiClient.updateAso(id, data)
export const deleteAso = (id: number) => apiClient.deleteAso(id)
export const getContratos = () => apiClient.getContratos()
export const createContrato = (data: ContratoPayload) => apiClient.createContrato(data)
export const updateContrato = (id: number, data: ContratoPayload) => apiClient.updateContrato(id, data)
export const deleteContrato = (id: number) => apiClient.deleteContrato(id)
