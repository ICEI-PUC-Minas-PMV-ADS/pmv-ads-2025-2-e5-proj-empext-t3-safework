import { Endereco } from '@/types/endereco'
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5219/api'


class ApiEnderecos {
    private axiosInstance: AxiosInstance
    private token: string | null = null

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        //ADICIONAR QUANDO PRECISAR USAR O TOKEN JWT NA REQUISICAO

        // if (typeof window !== 'undefined') {
        //     this.token = localStorage.getItem('auth_token')
        //     if (this.token) {
        //         this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        //     }
        // }
    }

    async getEnderecos(): Promise<Endereco[]> {
        const response = await this.axiosInstance.get<Endereco[]>("/endereco")
        return response.data
    }

    async createEndereco(endereco: Endereco): Promise<Endereco> {
        const response = await this.axiosInstance.post<Endereco>("/endereco", endereco)
        return response.data
    }

    async updateEndereco(id: number, endereco: Endereco): Promise<Endereco> {
        const response = await this.axiosInstance.put<Endereco>(`/endereco/${id}`, endereco)
        return response.data
    }

    async deleteEndereco(id: number): Promise<void> {
        await this.axiosInstance.delete<void>(`/endereco/${id}`)
    }
}

export const apiEnderecos = new ApiEnderecos(API_BASE_URL)

export const getEnderecos = () => apiEnderecos.getEnderecos()
export const createEndereco = (endereco: Endereco) => apiEnderecos.createEndereco(endereco)
export const updateEndereco = (id: number, endereco: Endereco) => apiEnderecos.updateEndereco(id, endereco)
export const deleteEndereco = (id: number) => apiEnderecos.deleteEndereco(id)
