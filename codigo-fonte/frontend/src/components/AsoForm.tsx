'use client';

import React, { useState, useEffect } from 'react';

// Interface para ASO baseada na estrutura da tabela
export interface Aso {
  id?: number;
  tipo_aso: number;
  data_solicitacao: string;
  data_validade: string;
  status: number;
  path_file?: string;
  observacoes?: string;
  id_colaborador: number;
}

// Enums baseados no backend
export enum TipoAso {
  Admissional = 1,
  Periodico = 2,
  RetornoAoTrabalho = 3,
  MudancaDeFuncao = 4,
  Demissional = 5
}

export enum StatusAso {
  Valido = 1,
  Vencido = 2,
  Aguardando = 3,
  Cancelado = 4
}

// Interface para props do componente
export interface AsoFormProps {
  aso?: Aso;
  onSubmit: (aso: Aso) => void;
  onCancel: () => void;
  colaboradores: Array<{ id: number; nome: string; empresa: string }>;
}

export default function AsoForm({ aso, onSubmit, onCancel, colaboradores }: AsoFormProps) {
  const [formData, setFormData] = useState<Aso>({
    tipo_aso: TipoAso.Admissional,
    data_solicitacao: '',
    data_validade: '',
    status: StatusAso.Aguardando,
    path_file: '',
    observacoes: '',
    id_colaborador: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (aso) {
      setFormData(aso);
    }
  }, [aso]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tipo_aso' || name === 'status' || name === 'id_colaborador' 
        ? parseInt(value) || 0 
        : value
    }));
    
    // Limpar erro quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.data_solicitacao) {
      newErrors.data_solicitacao = 'Data de solicitação é obrigatória';
    }

    if (!formData.data_validade) {
      newErrors.data_validade = 'Data de validade é obrigatória';
    }

    if (formData.id_colaborador === 0) {
      newErrors.id_colaborador = 'Colaborador é obrigatório';
    }

    // Validação de datas
    if (formData.data_solicitacao && formData.data_validade) {
      const dataSolicitacao = new Date(formData.data_solicitacao);
      const dataValidade = new Date(formData.data_validade);
      
      if (dataValidade <= dataSolicitacao) {
        newErrors.data_validade = 'Data de validade deve ser posterior à data de solicitação';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

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

  const getStatusAsoLabel = (status: number): string => {
    switch (status) {
      case StatusAso.Valido: return 'Válido';
      case StatusAso.Vencido: return 'Vencido';
      case StatusAso.Aguardando: return 'Aguardando';
      case StatusAso.Cancelado: return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {aso ? 'Editar ASO' : 'Nova ASO'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Colaborador - Campo obrigatório (chave estrangeira) */}
            <div>
              <label htmlFor="id_colaborador" className="block text-sm font-medium text-gray-900 mb-2">
                Colaborador <span className="text-red-500">*</span>
              </label>
              <select
                id="id_colaborador"
                name="id_colaborador"
                value={formData.id_colaborador}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.id_colaborador ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value={0}>Selecione um colaborador</option>
                {colaboradores.map((colaborador) => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.nome} - {colaborador.empresa}
                  </option>
                ))}
              </select>
              {errors.id_colaborador && (
                <p className="mt-1 text-sm text-red-600">{errors.id_colaborador}</p>
              )}
            </div>

            {/* Tipo de ASO - Campo obrigatório */}
            <div>
              <label htmlFor="tipo_aso" className="block text-sm font-medium text-gray-900 mb-2">
                Tipo de ASO <span className="text-red-500">*</span>
              </label>
              <select
                id="tipo_aso"
                name="tipo_aso"
                value={formData.tipo_aso}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {Object.values(TipoAso).filter(value => typeof value === 'number').map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {getTipoAsoLabel(tipo as number)}
                  </option>
                ))}
              </select>
            </div>

            {/* Data de Solicitação - Campo obrigatório */}
            <div>
              <label htmlFor="data_solicitacao" className="block text-sm font-medium text-gray-900 mb-2">
                Data de Solicitação <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="data_solicitacao"
                name="data_solicitacao"
                value={formData.data_solicitacao}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.data_solicitacao ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.data_solicitacao && (
                <p className="mt-1 text-sm text-red-600">{errors.data_solicitacao}</p>
              )}
            </div>

            {/* Data de Validade - Campo obrigatório */}
            <div>
              <label htmlFor="data_validade" className="block text-sm font-medium text-gray-900 mb-2">
                Data de Validade <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="data_validade"
                name="data_validade"
                value={formData.data_validade}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.data_validade ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.data_validade && (
                <p className="mt-1 text-sm text-red-600">{errors.data_validade}</p>
              )}
            </div>

            {/* Status - Campo obrigatório */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {Object.values(StatusAso).filter(value => typeof value === 'number').map((status) => (
                  <option key={status} value={status}>
                    {getStatusAsoLabel(status as number)}
                  </option>
                ))}
              </select>
            </div>

            {/* Arquivo - Campo opcional */}
            <div>
              <label htmlFor="path_file" className="block text-sm font-medium text-gray-900 mb-2">
                Arquivo (Caminho)
              </label>
              <input
                type="text"
                id="path_file"
                name="path_file"
                value={formData.path_file || ''}
                onChange={handleInputChange}
                placeholder="Caminho do arquivo ASO"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>

            {/* Observações - Campo opcional */}
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-900 mb-2">
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes || ''}
                onChange={handleInputChange}
                rows={4}
                placeholder="Observações sobre a ASO"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {aso ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}