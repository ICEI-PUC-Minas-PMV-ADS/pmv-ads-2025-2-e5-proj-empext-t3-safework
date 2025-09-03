using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    [Table("colaboradores")]
    public class Colaborador : DadosCadastrais
    {
        [Column("funcao")]
        public string Funcao { get; set; } = null!;

        [Column("id_empresa_cliente")]
        public int IdEmpresaCliente { get; set; }
        public EmpresaCliente EmpresaCliente { get; set; } = null!;
        public ICollection<Aso> Asos { get; set; } = new List<Aso>();
    }
}