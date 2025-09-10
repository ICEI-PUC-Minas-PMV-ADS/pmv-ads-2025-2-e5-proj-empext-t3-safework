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
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null)
          throw new Error('Sessão expirada. Faça login novamente.')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro de conexão com o servidor')
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/Login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/Login/me')
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/Usuario')
  }

  async getUserById(id: number): Promise<User> {
    return this.request<User>(`/Usuario/${id}`)
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
