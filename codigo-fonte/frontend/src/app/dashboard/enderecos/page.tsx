'use client'

import { useState, useMemo, useEffect } from 'react'
import { Endereco, EnderecoFormData } from '../../../types/endereco'
import { EnderecoForm } from '../../../components/EnderecoForm'
import { apiEnderecos } from '@/lib/api_enderecos'

export default function EnderecosPage() {
  // Mock data para endereços
  const [enderecos, setEnderecos] = useState<Endereco[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUf, setSelectedUf] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEndereco, setEditingEndereco] = useState<Endereco | null>(null)

  useEffect(() => {
      const initializeEnderecos = async () => {
        try {
          const enderecosData = await apiEnderecos.getEnderecos()
          setEnderecos(enderecosData)
        } catch (error) {
          console.error('Erro ao inicializar endereços:', error)
        } 
      }

      initializeEnderecos()
    }, [])

  // Filtros e estatísticas
  const filteredEnderecos = useMemo(() => {
    return enderecos.filter(endereco => {
      const matchesSearch = searchTerm === '' || 
        endereco.logradouro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endereco.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endereco.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endereco.cep.includes(searchTerm)

      const matchesUf = selectedUf === '' || endereco.uf === selectedUf

      return matchesSearch && matchesUf
    })
  }, [enderecos, searchTerm, selectedUf])

  const totalEnderecos = enderecos.length
  const enderecosPorUf = useMemo(() => {
    const count: { [key: string]: number } = {}
    enderecos.forEach(endereco => {
      count[endereco.uf] = (count[endereco.uf] || 0) + 1
    })
    return count
  }, [enderecos])

  const estadosUnicos = useMemo(() => {
    const ufs = [...new Set(enderecos.map(endereco => endereco.uf))].sort()
    return ufs
  }, [enderecos])

  const handleSaveEndereco = (enderecoData: EnderecoFormData) => {
    if (editingEndereco) {
      // Editar endereço existente
      apiEnderecos.updateEndereco(editingEndereco.id, enderecoData as Endereco).then((updatedEndereco) => {
        setEnderecos(prev => prev.map(endereco => 
          endereco.id === updatedEndereco.id ? updatedEndereco : endereco
        ))
      }).catch((error) => {
        console.error('Erro ao atualizar endereço:', error)
      })
    } else {
      // Criar novo endereço
      apiEnderecos.createEndereco(enderecoData as Endereco).then((newEndereco) => {
        setEnderecos(prev => [...prev, newEndereco])
      }).catch((error) => {
        console.error('Erro ao criar endereço:', error)
      })
    }
    
    setShowForm(false)
    setEditingEndereco(null)
  }

  const handleEditEndereco = (endereco: Endereco) => {
    setEditingEndereco(endereco)
    setShowForm(true)
  }

  const handleDeleteEndereco = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      apiEnderecos.deleteEndereco(id).then(() => {
        setEnderecos(prev => prev.filter(endereco => endereco.id !== id))
      }).catch((error) => {
        console.error('Erro ao excluir endereço:', error)
      })
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingEndereco(null)
  }

  if (showForm) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={handleCancelForm}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Voltar para lista
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {editingEndereco ? 'Editar Endereço' : 'Novo Endereço'}
          </h1>
        </div>
        <EnderecoForm
          endereco={editingEndereco}
          onSave={handleSaveEndereco}
          onCancel={handleCancelForm}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Endereços</h1>
          <p className="text-gray-600">Gerencie os endereços cadastrados no sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span>
          Novo Endereço
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📍</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Endereços</p>
              <p className="text-2xl font-bold text-gray-900">{totalEnderecos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">🏢</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estados Cadastrados</p>
              <p className="text-2xl font-bold text-gray-900">{estadosUnicos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">🏙️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cidades Únicas</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...new Set(enderecos.map(e => e.municipio))].length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">📮</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">CEPs Únicos</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...new Set(enderecos.map(e => e.cep))].length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por logradouro, bairro, cidade ou CEP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={selectedUf}
              onChange={(e) => setSelectedUf(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os Estados</option>
              {estadosUnicos.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Endereços */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logradouro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complemento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bairro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade/UF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CEP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnderecos.map((endereco) => (
                <tr key={endereco.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endereco.logradouro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endereco.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {endereco.complemento || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endereco.bairro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endereco.municipio}/{endereco.uf}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endereco.cep}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEndereco(endereco)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar"
                      >
                        <span>✏️</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEndereco(endereco.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Excluir"
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnderecos.length === 0 && (
          <div className="text-center py-12">
            <span className="mx-auto h-12 w-12 text-gray-400 text-4xl">📍</span>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum endereço encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedUf ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando um novo endereço.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}