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
        public string CpfCnpj { get; set; } = null!;

        [Required]
        [Column("nome_razao")]
        public string NomeRazao { get; set; } = null!;

        [Column("nome_fantasia")]
        public string NomeFantasia { get; set; } = null!;

        [Column("telefone")]
        public string Telefone { get; set; } = null!;

        [Column("celular")]
        public string Celular { get; set; } = null!;

        [Column("email")]
        public string Email { get; set; } = null!;

        [Required]
        [Column("status")]
        public bool Status { get; set; }

        [Column("id_endereco")]
        public string IdEndereco { get; set; } = null!;

        public Endereco Endereco { get; set; } = null!;

    }
}