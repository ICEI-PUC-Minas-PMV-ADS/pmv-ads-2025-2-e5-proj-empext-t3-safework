import { Empresa, EmpresaFormData } from '@/types/empresas'
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
        const response = await this.axiosInstance.get<Empresa[]>("/Empresa")
        return response.data
    }

    async createEmpresas(empresa: EmpresaFormData): Promise<Empresa> {
        console.log(`Dados a serem enviados celular: ${empresa.celular} `)
        console.log(`Dados a serem enviados cpfcnpj: ${empresa.cpfCnpj} `)
        console.log(`Dados a serem enviados email: ${empresa.email} `)
        console.log(`Dados a serem enviados idEndereco: ${empresa.idEndereco} `)
        console.log(`Dados a serem enviados nomeFantasia: ${empresa.nomeFantasia} `)
        console.log(`Dados a serem enviados nomeRazao: ${empresa.nomeRazao} `)
        console.log(`Dados a serem enviados status: ${empresa.status} `)
        console.log(`Dados a serem enviados telefone: ${empresa.telefone} `)
        console.log(`Dados a serem enviados tipoPessoa: ${empresa.tipoPessoa} `)
        const response = await this.axiosInstance.post<Empresa>("/Empresa", empresa)
        return response.data
    }

    async updateEmpresas(id: number, empresa: Empresa): Promise<Empresa> {
        const response = await this.axiosInstance.put<Empresa>(`/Empresa/${id}`, empresa)
        return response.data
    }

    async deleteEmpresas(id: number): Promise<void> {
        await this.axiosInstance.delete<void>(`/Empresa/${id}`)
    }
}

export const apiEmpresas = new ApiEmpresa(API_BASE_URL)

export const getEnderecos = () => apiEmpresas.getEmpresas()
export const createEndereco = (empresa: Empresa) => apiEmpresas.createEmpresas(empresa)
export const updateEndereco = (id: number, empresa: Empresa) => apiEmpresas.updateEmpresas(id, empresa)
export const deleteEndereco = (id: number) => apiEmpresas.deleteEmpresas(id)
