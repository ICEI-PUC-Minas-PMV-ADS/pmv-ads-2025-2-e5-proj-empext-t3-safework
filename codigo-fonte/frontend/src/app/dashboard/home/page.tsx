'use client'

import { getAsos, getColaboradores, getEmpresas } from '@/lib/api';
import { Aso } from '@/types/aso';
import { Colaborador } from '@/types/colaborador';
import { Empresa } from '@/types/empresas';
import React, { useEffect, useState } from 'react';

type RequestState = 'idle' | 'loading' | 'saving'
type SearchField = 'colaborador' | 'empresa' | 'cargo'

//Puxa os dados das asos, colaboradores e empresa associada ao colaborador

export default function HomePage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [asos, setAsos] = useState<Aso[]>([])
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [searchField, setSearchField] = useState<SearchField>('colaborador');

  const [state, setState] = useState<RequestState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setState('loading')
      try {
        const [colaboradoresData, empresasData, asosData] = await Promise.all([
          getColaboradores(),
          getEmpresas(),
          getAsos()
        ])

        setColaboradores(colaboradoresData);
        setEmpresas(empresasData);
        setAsos(asosData);
        console.log(empresasData)
        setErrorMessage(null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os colaboradores.'
        setErrorMessage(message)
      } finally {
        setState('idle')
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'Vencido':
        return 'bg-red-500 text-white';
      case 'Vencendo':
        return 'bg-yellow-500 text-white';
      case 'Válido':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredColaboradores = colaboradores.filter(colab => {
    let matchesSearch = true;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();

      switch (searchField) {
        case 'colaborador':
          matchesSearch = colab.nomeRazao.toLowerCase().includes(searchLower);
          break;
        case 'empresa':
          matchesSearch = colab.empresaClienteNome?.toLowerCase().includes(searchLower) || false;
          break;
        case 'cargo':
          matchesSearch = colab.funcao?.toLowerCase().includes(searchLower) || false;
          break;
      }
    }

    const matchesFilter = filterType === 'Todos';
    // const matchesFilter = filterType === 'Todos' || colab.statusASO === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Gestão de Atestados de Saúde</p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total de Colaboradores</p>
                <h2 className="text-4xl font-bold text-gray-900">{colaboradores.length}</h2>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            {/* <p className="text-green-600 text-sm font-medium">+ 12% esse mês</p> */}
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">ASO Válidos</p>
                <h2 className="text-4xl font-bold text-gray-900">189</h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm">77% do total</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Próximos ao Vencimento</p>
                <h2 className="text-4xl font-bold text-gray-900">21</h2>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Próximos 30 dias</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">ASO Vencidos</p>
                <h2 className="text-4xl font-bold text-gray-900">6</h2>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-red-600 text-sm font-medium">Requer atenção</p>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Empresas Parceiras */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Empresas Parceiras</p>
                <h2 className="text-4xl font-bold text-gray-900">{empresas.length}</h2>
                <p className="text-gray-600 text-sm mt-2">Ativas</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* ASO Realizados */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">ASO Realizados (Mês)</p>
                <h2 className="text-4xl font-bold text-gray-900">15</h2>
                <p className="text-green-600 text-sm font-medium mt-2">+18% vs mês anterior</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Funcionários e Status ASO</h3>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as SearchField)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="colaborador">Colaborador</option>
              <option value="empresa">Empresa</option>
              <option value="cargo">Cargo</option>
            </select>

            <div className="flex-1 min-w-[200px] max-w-md relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={`Buscar por ${searchField === 'colaborador' ? 'colaborador' : searchField === 'empresa' ? 'empresa' : 'cargo'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option>Todos</option>
              <option>Válido</option>
              <option>Vencendo</option>
              <option>Vencido</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Colaborador</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Empresa</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cargo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status ASO</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data ASO</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredColaboradores.map((colab) => (
                  <tr key={colab.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{colab.nomeRazao}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{colab.empresaClienteNome}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{colab.funcao}</td>
                    <td className="px-6 py-4">
                      {/* <span className={`px-4 py-1 rounded-full text-xs font-semibold ${getStatusColor(colab.statusASO)}`}>
                        {colab.statusASO}
                      </span> */}
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700">{colab.dataASO}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{colab.vencimento}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}