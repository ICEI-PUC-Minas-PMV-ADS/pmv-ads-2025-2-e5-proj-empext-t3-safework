using System;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class EmpresaContratoResumoDto
    {
        public int Id { get; set; }
        public string NomeRazao { get; set; } = string.Empty;
        public string CpfCnpj { get; set; } = string.Empty;
    }

    public class ContratoDto
    {
        public int Id { get; set; }
        public string Numero { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }
        public StatusContrato StatusContrato { get; set; }
        public string? PathFile { get; set; }
        public decimal Valor { get; set; }
        public string? Observacoes { get; set; }
        public int IdEmpresaCliente { get; set; }
        public int IdEmpresaPrestadora { get; set; }
        public EmpresaContratoResumoDto? EmpresaCliente { get; set; }
        public EmpresaContratoResumoDto? EmpresaPrestadora { get; set; }
    }
}

