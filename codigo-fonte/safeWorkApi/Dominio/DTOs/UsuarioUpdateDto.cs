using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Controller
{
    public class UsuarioUpdateDto
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