using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    [Table("Perfis")]
    public class Perfil
    {
        [Key]
        public string Id { get; set; }
        public string Nome_perfil { get; set; } = string.Empty;
        public ICollection<Usuario> Usuario { get; set; } = new List<Usuario>();
    }
}