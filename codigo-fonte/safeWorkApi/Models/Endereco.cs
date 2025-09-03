using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    [Table("enderecos")]
    public class Endereco
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column("logradouro")]
        public string Logradouro { get; set; } = null!;

        [Required]
        [Column("numero")]
        public string Numero { get; set; } = null!;

        [Column("complemento")]
        public string Complemento { get; set; } = null!;

        [Required]
        [Column("bairro")]
        public string Bairro { get; set; } = null!;

        [Required]
        [Column("municipio")]
        public string Municipio { get; set; } = null!;

        [Required]
        [Column("uf")]
        public string Uf { get; set; } = null!;

        [Required]
        [Column("cep")]
        public string Cep { get; set; } = null!;

        public ICollection<Colaborador> Colaborador { get; set; } = new List<Colaborador>();
        public ICollection<EmpresaCliente> EmpresaCliente { get; set; } = new List<EmpresaCliente>();
        public ICollection<EmpresaPrestadora> EmpresaPrestadora { get; set; } = new List<EmpresaPrestadora>();
    }
}