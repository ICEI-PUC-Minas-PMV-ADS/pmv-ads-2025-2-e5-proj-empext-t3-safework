using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class LoginResponseDto
    {
        public string JwtToken { get; set; } = string.Empty;
        public UsuarioDto Usuario { get; set; } = new UsuarioDto();
    }
}
