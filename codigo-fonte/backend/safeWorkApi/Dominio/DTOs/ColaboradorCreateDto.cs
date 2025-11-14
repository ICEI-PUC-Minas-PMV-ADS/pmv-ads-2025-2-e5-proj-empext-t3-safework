using System.ComponentModel.DataAnnotations;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class ColaboradorCreateDto
    {
        [Required]
        public TipoPessoa TipoPessoa { get; set; }

        [Required]
        public string CpfCnpj { get; set; } = string.Empty;

        [Required]
        public string NomeRazao { get; set; } = string.Empty;

        public string? NomeFantasia { get; set; }

        public string? Telefone { get; set; }

        public string? Celular { get; set; }

        public string? Email { get; set; }

        [Required]
        public bool Status { get; set; }

        public int? IdEndereco { get; set; }

        [Required]
        public string Funcao { get; set; } = string.Empty;

        [Required]
        public int IdEmpresaCliente { get; set; }
    }
}

