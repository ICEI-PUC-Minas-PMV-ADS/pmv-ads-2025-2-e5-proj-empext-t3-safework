using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    public enum TipoPessoa
    {
        Fisica = 1,
        Juridica = 2
    }
    public abstract class DadosCadastrais
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column("tipo_pessoa")]
        public TipoPessoa TipoPessoa { get; set; }

        [Required]
        [Column("cpf_cnpj")]
        [MaxLength(14)]
        [MinLength(11)]
        public string? CpfCnpj { get; set; }

        [Required]
        [Column("nome_razao")]
        public string? NomeRazao { get; set; }

        [Column("nome_fantasia")]
        public string? NomeFantasia { get; set; }

        [Column("telefone")]
        public string? Telefone { get; set; }

        [Column("celular")]
        public string? Celular { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Required]
        [Column("status")]
        public bool Status { get; set; }

        [Column("id_endereco")]
        public int? IdEndereco { get; set; }

        public Endereco? Endereco { get; set; }

    }
}