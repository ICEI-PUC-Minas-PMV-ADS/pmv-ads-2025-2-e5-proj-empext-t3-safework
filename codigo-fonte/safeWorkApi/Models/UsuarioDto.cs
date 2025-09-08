using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    public class UsuarioDto
    {
        public string NomeCompleto { get; set; } = null!;
        [Required]
        public string Email { get; set; } = null!;
        [Required]
        public string Senha { get; set; } = null!;

        [Required]
        public int IdPerfil { get; set; }
    }
}