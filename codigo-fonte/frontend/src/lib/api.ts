import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5219/api'

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
