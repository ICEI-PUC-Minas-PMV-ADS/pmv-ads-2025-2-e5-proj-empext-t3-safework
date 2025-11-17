using System.ComponentModel.DataAnnotations;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class ColaboradorDto
    {
        public int Id { get; set; }

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

        public bool Status { get; set; }

        public int? IdEndereco { get; set; }

        [Required]
        public string Funcao { get; set; } = string.Empty;

        [Required]
        public int IdEmpresaCliente { get; set; }

        public string? EmpresaClienteNome { get; set; }

        public EnderecoResumoDto? Endereco { get; set; }
    }

    public class EnderecoResumoDto
    {
        public int Id { get; set; }
        public string Logradouro { get; set; } = string.Empty;
        public string Numero { get; set; } = string.Empty;
        public string? Complemento { get; set; }
        public string Bairro { get; set; } = string.Empty;
        public string Municipio { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public string Cep { get; set; } = string.Empty;
    }
}

