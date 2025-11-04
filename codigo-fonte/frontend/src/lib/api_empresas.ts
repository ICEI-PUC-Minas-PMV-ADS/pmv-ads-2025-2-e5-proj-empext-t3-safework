import { Empresa } from '@/types/empresas'
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5219/api'


class ApiEmpresa {
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

    async getEmpresas(): Promise<Empresa[]> {
        const response = await this.axiosInstance.get<Empresa[]>("/empresa")
        return response.data
    }
}

export const apiEmpresas = new ApiEmpresa(API_BASE_URL)

export const  = () => apiEmpresas.getEmpresas()
