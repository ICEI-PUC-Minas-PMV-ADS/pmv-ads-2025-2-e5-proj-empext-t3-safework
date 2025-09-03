using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        public int Id { get; set; }
        [Column("nome_completo")]
        public string NomeCompleto { get; set; } = null!;

        [Required]
        [Column("email")]
        public string Email { get; set; } = null!;

        [Required]
        [JsonIgnore]
        [Column("senha")]
        public string Senha { get; set; } = null!;

        [Required]
        [Column("id_empresa_prestadora")]
        public int IdEmpresaPrestadora { get; set; }
        public EmpresaPrestadora EmpresaPrestadora { get; set; } = null!;

        [Required]
        [Column("id_perfil")]
        public int IdPerfil { get; set; }
        public Perfil Perfil { get; set; } = null!;
    }
}