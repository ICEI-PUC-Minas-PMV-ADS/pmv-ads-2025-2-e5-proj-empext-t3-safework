using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class EmpresaClienteDTO
    {
        public int Id { get; set; }

        [Required]
        [RegularExpression("^(Fisica|Juridica)$", ErrorMessage = "O tipo de pessoa deve ser 'Fisica' ou 'Juridica'.")]
        public TipoPessoa TipoPessoa { get; set; }

        [Required]
        public string CpfCnpj { get; set; } = string.Empty;

        [Required]
        public string NomeRazao { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        public string? Telefone { get; set; }
        public string? Celular { get; set; }

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "O e-mail informado não é válido.")]
        public string Email { get; set; } = string.Empty;

        [Required]
        public bool Status { get; set; }
        public int? IdEndereco { get; set; }
    }
}