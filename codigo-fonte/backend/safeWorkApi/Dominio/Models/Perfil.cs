using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    [Table("perfis")]
    public class Perfil
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column("nome_perfil")]
        public string NomePerfil { get; set; } = string.Empty;
        public ICollection<Usuario> Usuario { get; set; } = new List<Usuario>();
    }
}