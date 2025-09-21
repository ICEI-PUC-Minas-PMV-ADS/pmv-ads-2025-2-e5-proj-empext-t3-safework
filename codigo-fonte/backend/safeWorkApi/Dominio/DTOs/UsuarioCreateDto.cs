using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Dominio.DTOs
{
    public class UsuarioCreateDto
    {
        public string NomeCompleto { get; set; } = default!;

        [Required]
        public string Email { get; set; } = default!;

        [Required]
        public string Senha { get; set; } = default!;

        [Required]
        public int IdPerfil { get; set; } = default!;


    }
}