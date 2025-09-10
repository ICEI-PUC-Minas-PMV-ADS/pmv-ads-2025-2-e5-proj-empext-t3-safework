using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    [Table("colaboradores")]
    public class Colaborador : DadosCadastrais
    {
        [Required]
        [Column("funcao")]
        public string Funcao { get; set; } = null!;

        [Required]
        [Column("id_empresa_cliente")]
        public int IdEmpresaCliente { get; set; }
        public EmpresaCliente EmpresaCliente { get; set; } = null!;
        public ICollection<Aso> Asos { get; set; } = new List<Aso>();
    }
}