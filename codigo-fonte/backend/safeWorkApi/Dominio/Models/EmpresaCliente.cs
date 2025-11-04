using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    [Table("empresa_cliente")]
    public class EmpresaCliente : DadosCadastrais
    {
        public ICollection<Colaborador> Colaboradores { get; set; } = new List<Colaborador>();

        public ICollection<Contrato> Contratos { get; set; } = new List<Contrato>();
    }

}