using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    public enum StatusContrato
    {
        Ativo = 1,
        Inativo = 2,
        Suspenso = 3
    }
    [Table("contratos")]
    public class Contrato
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column("numero")]
        public string Numero { get; set; } = null!;

        [Required]
        [Column("data_inicio")]
        public DateTime DataInicio { get; set; }

        [Required]
        [Column("data_fim")]
        public DateTime DataFim { get; set; }

        [Required]
        [Column("status_contrato")]
        public StatusContrato StatusContrato { get; set; }

        [Required]
        [Column("valor")]
        public decimal Valor { get; set; }

        [Column("observacoes")]
        public string Observacoes { get; set; } = null!;

        [Required]
        [Column("id_empresa_cliente")]
        public int IdEmpresaCliente { get; set; }
        public EmpresaCliente EmpresaCliente { get; set; } = null!;

        [Required]
        [Column("id_empresa_prestadora")]
        public int IdEmpresaPrestadora { get; set; }
        public EmpresaPrestadora EmpresaPrestadora { get; set; } = null!;
    }
}