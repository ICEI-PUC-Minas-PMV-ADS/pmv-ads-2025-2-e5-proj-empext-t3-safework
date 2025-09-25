'use client';

import React, { useState } from 'react';
import AsoForm, { Aso, TipoAso, StatusAso } from '../../../components/AsoForm';

// Interface para colaborador (dados mockados)
interface Colaborador {
  id: number;
  nome: string;
  empresa: string;
  funcao: string;
}

// Dados mockados para colaboradores
const colaboradoresMock: Colaborador[] = [
  { id: 1, nome: 'João Silva', empresa: 'Empresa Alpha Ltda', funcao: 'Operador' },
  { id: 2, nome: 'Maria Santos', empresa: 'Beta Construções S.A.', funcao: 'Técnica de Segurança' },
  { id: 3, nome: 'Pedro Oliveira', empresa: 'Gamma Indústria', funcao: 'Soldador' },
  { id: 4, nome: 'Ana Costa', empresa: 'Delta Serviços', funcao: 'Supervisora' },
  { id: 5, nome: 'Carlos Ferreira', empresa: 'Epsilon Engenharia', funcao: 'Eletricista' },
];

// Dados mockados para ASOs
const asosMock: Aso[] = [
  {
    id: 1,
    tipo_aso: TipoAso.Admissional,
    data_solicitacao: '2024-01-15',
    data_validade: '2025-01-15',
    status: StatusAso.Valido,
    path_file: '/docs/aso_001.pdf',
    observacoes: 'ASO admissional realizada sem restrições',
    id_colaborador: 1,
  },
  {
    id: 2,
    tipo_aso: TipoAso.Periodico,
    data_solicitacao: '2024-06-10',
    data_validade: '2025-06-10',
    status: StatusAso.Valido,
    path_file: '/docs/aso_002.pdf',
    observacoes: 'Exame periódico anual',
    id_colaborador: 2,
  },
  {
    id: 3,
    tipo_aso: TipoAso.Demissional,
    data_solicitacao: '2024-12-01',
    data_validade: '2024-12-01',
    status: StatusAso.Aguardando,
    path_file: '',
    observacoes: 'Aguardando resultado dos exames',
    id_colaborador: 3,
  },
  {
    id: 4,
    tipo_aso: TipoAso.MudancaDeFuncao,
    data_solicitacao: '2024-03-20',
    data_validade: '2025-03-20',
    status: StatusAso.Vencido,
    path_file: '/docs/aso_004.pdf',
    observacoes: 'ASO para mudança de função - vencida',
    id_colaborador: 4,
  },
  {
    id: 5,
    tipo_aso: TipoAso.RetornoAoTrabalho,
    data_solicitacao: '2024-11-05',
    data_validade: '2025-11-05',
    status: StatusAso.Valido,
    path_file: '/docs/aso_005.pdf',
    observacoes: 'Retorno após afastamento médico',
    id_colaborador: 5,
  },
];

export default function AsosPage() {
  const [asos, setAsos] = useState<Aso[]>(asosMock);
  const [filteredAsos, setFilteredAsos] = useState<Aso[]>(asosMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [tipoFilter, setTipoFilter] = useState<number | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingAso, setEditingAso] = useState<Aso | undefined>(undefined);

  // Função para buscar colaborador por ID
  const getColaboradorById = (id: number): Colaborador | undefined => {
    return colaboradoresMock.find(col => col.id === id);
  };

  // Função para obter label do tipo de ASO
  const getTipoAsoLabel = (tipo: number): string => {
    switch (tipo) {
      case TipoAso.Admissional: return 'Admissional';
      case TipoAso.Periodico: return 'Periódico';
      case TipoAso.RetornoAoTrabalho: return 'Retorno ao Trabalho';
      case TipoAso.MudancaDeFuncao: return 'Mudança de Função';
      case TipoAso.Demissional: return 'Demissional';
      default: return 'Desconhecido';
    }
  };

  // Função para obter label do status
  const getStatusAsoLabel = (status: number): string => {
    switch (status) {
      case StatusAso.Valido: return 'Válido';
      case StatusAso.Vencido: return 'Vencido';
      case StatusAso.Aguardando: return 'Aguardando';
      case StatusAso.Cancelado: return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  // Função para obter cor do badge de status
  const getStatusBadgeColor = (status: number): string => {
    switch (status) {
      case StatusAso.Valido: return 'bg-green-100 text-green-800';
      case StatusAso.Vencido: return 'bg-red-100 text-red-800';
      case StatusAso.Aguardando: return 'bg-yellow-100 text-yellow-800';
      case StatusAso.Cancelado: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para filtrar ASOs
  const handleSearch = (term: string, status: number | '', tipo: number | '') => {
    let filtered = asos;

    if (term) {
      filtered = filtered.filter(aso => {
        const colaborador = getColaboradorById(aso.id_colaborador);
        return colaborador?.nome.toLowerCase().includes(term.toLowerCase()) ||
               colaborador?.empresa.toLowerCase().includes(term.toLowerCase()) ||
               getTipoAsoLabel(aso.tipo_aso).toLowerCase().includes(term.toLowerCase());
      });
    }

    if (status !== '') {
      filtered = filtered.filter(aso => aso.status === status);
    }

    if (tipo !== '') {
      filtered = filtered.filter(aso => aso.tipo_aso === tipo);
    }

    setFilteredAsos(filtered);
  };

  // Handlers para filtros
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term, statusFilter, tipoFilter);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value === '' ? '' : parseInt(e.target.value);
    setStatusFilter(status);
    handleSearch(searchTerm, status, tipoFilter);
  };

  const handleTipoFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value === '' ? '' : parseInt(e.target.value);
    setTipoFilter(tipo);
    handleSearch(searchTerm, statusFilter, tipo);
  };

  // Função para adicionar nova ASO
  const handleAddAso = () => {
    setEditingAso(undefined);
    setShowForm(true);
  };

  // Função para editar ASO
  const handleEditAso = (aso: Aso) => {
    setEditingAso(aso);
    setShowForm(true);
  };

  // Função para deletar ASO
  const handleDeleteAso = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta ASO?')) {
      const updatedAsos = asos.filter(aso => aso.id !== id);
      setAsos(updatedAsos);
      setFilteredAsos(updatedAsos);
    }
  };

  // Função para submeter formulário
  const handleFormSubmit = (asoData: Aso) => {
    if (editingAso) {
      // Editar ASO existente
      const updatedAsos = asos.map(aso => 
        aso.id === editingAso.id ? { ...asoData, id: editingAso.id } : aso
      );
      setAsos(updatedAsos);
      setFilteredAsos(updatedAsos);
    } else {
      // Adicionar nova ASO
      const newAso = { ...asoData, id: Math.max(...asos.map(a => a.id || 0)) + 1 };
      const updatedAsos = [...asos, newAso];
      setAsos(updatedAsos);
      setFilteredAsos(updatedAsos);
    }
    setShowForm(false);
    setEditingAso(undefined);
  };

  // Função para cancelar formulário
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAso(undefined);
  };

  // Calcular estatísticas
  const totalAsos = asos.length;
  const asosValidas = asos.filter(aso => aso.status === StatusAso.Valido).length;
  const asosVencidas = asos.filter(aso => aso.status === StatusAso.Vencido).length;
  const asosAguardando = asos.filter(aso => aso.status === StatusAso.Aguardando).length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de ASOs</h1>
        <p className="text-gray-600">Gerencie os Atestados de Saúde Ocupacional dos colaboradores</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de ASOs</p>
              <p className="text-2xl font-bold text-gray-900">{totalAsos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ASOs Válidas</p>
              <p className="text-2xl font-bold text-green-600">{asosValidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ASOs Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{asosVencidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aguardando</p>
              <p className="text-2xl font-bold text-yellow-600">{asosAguardando}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por colaborador, empresa ou tipo de ASO..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Todos os Status</option>
              <option value={StatusAso.Valido}>Válido</option>
              <option value={StatusAso.Vencido}>Vencido</option>
              <option value={StatusAso.Aguardando}>Aguardando</option>
              <option value={StatusAso.Cancelado}>Cancelado</option>
            </select>
            <select
              value={tipoFilter}
              onChange={handleTipoFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Todos os Tipos</option>
              <option value={TipoAso.Admissional}>Admissional</option>
              <option value={TipoAso.Periodico}>Periódico</option>
              <option value={TipoAso.RetornoAoTrabalho}>Retorno ao Trabalho</option>
              <option value={TipoAso.MudancaDeFuncao}>Mudança de Função</option>
              <option value={TipoAso.Demissional}>Demissional</option>
            </select>
            <button
              onClick={handleAddAso}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
            >
              Nova ASO
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de ASOs */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Validade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAsos.map((aso) => {
                const colaborador = getColaboradorById(aso.id_colaborador);
                return (
                  <tr key={aso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {colaborador?.nome || 'Colaborador não encontrado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {colaborador?.empresa} - {colaborador?.funcao}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTipoAsoLabel(aso.tipo_aso)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(aso.data_solicitacao).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(aso.data_validade).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(aso.status)}`}>
                        {getStatusAsoLabel(aso.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditAso(aso)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAso(aso.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAsos.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma ASO encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Não há ASOs que correspondam aos filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <AsoForm
          aso={editingAso}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          colaboradores={colaboradoresMock.map(col => ({
            id: col.id,
            nome: col.nome,
            empresa: col.empresa
          }))}
        />
      )}
    </div>
  );
}