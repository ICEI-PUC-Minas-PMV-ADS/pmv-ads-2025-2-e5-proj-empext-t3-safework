using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace safeWorkApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoginController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Login(AuthenticateDto model)
        {
            if (model is null || (
                string.IsNullOrWhiteSpace(model.Email) &&
                string.IsNullOrWhiteSpace(model.Senha)))
                return Unauthorized();

            Usuario? usuarioDb = await _context.Usuarios.AsNoTracking()
                .Include(u => u.Perfil)
                .FirstOrDefaultAsync(c => c.Email == model.Email);


            if (usuarioDb is null || !BCrypt.Net.BCrypt.Verify(model.Senha, usuarioDb.Senha)) return Unauthorized();

            var jwt = GenerateJwtToken(usuarioDb);
            return Ok(new { jwtToken = jwt });
        }


        private string GenerateJwtToken(Usuario model)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            //Chave de criptografia deve ser o mesmo do program.cs
            var key = Encoding.ASCII.GetBytes("BjRxlIiDQHvTrRQM3Ke4CeS9uE3RZODH");
            var claims = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Email, model.Email),
                new Claim(ClaimTypes.Role, model.IdPerfil.ToString())
            });

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = claims,
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


    }
}