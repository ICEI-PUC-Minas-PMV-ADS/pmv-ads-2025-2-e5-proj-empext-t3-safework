using System;
using System.ComponentModel.DataAnnotations;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class ContratoCreateDto
    {
        [Required]
        public string Numero { get; set; } = string.Empty;

        [Required]
        public DateTime DataInicio { get; set; }

        [Required]
        public DateTime DataFim { get; set; }

        [Required]
        public StatusContrato StatusContrato { get; set; }

        public string? PathFile { get; set; }

        [Required]
        public decimal Valor { get; set; }

        public string? Observacoes { get; set; }

        [Required]
        public int IdEmpresaCliente { get; set; }

        [Required]
        public int IdEmpresaPrestadora { get; set; }
    }
}

