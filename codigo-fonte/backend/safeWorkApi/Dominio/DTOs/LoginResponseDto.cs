using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class LoginResponseDto
    {
        public string jwtToken { get; set; } = string.Empty;
        public UsuarioDto usuario { get; set; } = new UsuarioDto();
    }
}
