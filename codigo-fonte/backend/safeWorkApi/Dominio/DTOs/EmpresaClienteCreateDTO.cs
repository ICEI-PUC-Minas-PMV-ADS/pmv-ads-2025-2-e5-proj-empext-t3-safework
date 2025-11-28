using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class EmpresaClienteCreateDTO
    {
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
        [EmailAddress(ErrorMessage = "O e-mail informado não é válido")]
        public string Email { get; set; } = string.Empty;

        public bool Status { get; set; }
        public int? IdEndereco { get; set; }

        //Dado para Criação do Contrato com a emrpesa cliente
        public string NumeroContrato { get; set; } = string.Empty;

        public string PathFileContrato { get; set; } = string.Empty;

        public decimal ValorContrato { get; set; } = 0;

        public string ObservacoesContrato { get; set; } = string.Empty;

        [Required]
        public DateTime DataInicioContrato { get; set; }
        [Required]
        public DateTime DataFimContrato { get; set; }
    }

}