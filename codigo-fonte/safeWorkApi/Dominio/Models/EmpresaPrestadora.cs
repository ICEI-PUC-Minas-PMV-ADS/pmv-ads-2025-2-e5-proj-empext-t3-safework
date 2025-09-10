using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    public class EmpresaPrestadora : DadosCadastrais
    {
        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();

        public ICollection<Contrato> Contratos { get; set; } = new List<Contrato>();
    }
}