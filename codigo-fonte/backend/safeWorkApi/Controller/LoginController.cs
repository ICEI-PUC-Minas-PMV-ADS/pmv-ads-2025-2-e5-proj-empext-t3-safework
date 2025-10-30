using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using safeWorkApi.service;

namespace safeWorkApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TempDataService? _tempData;

        public LoginController(AppDbContext context, TempDataService tempData)
        {
            _context = context;
            _tempData = tempData;
        }

        [HttpPost]
        public async Task<IActionResult> Login(AuthenticateDto model)
        {
            if (model is null || (
                string.IsNullOrWhiteSpace(model.Email) &&
                string.IsNullOrWhiteSpace(model.Senha)))
                return Unauthorized(new { message = "Email e senha são obrigatórios" });

            Usuario? usuarioDb = await _context.Usuarios.AsNoTracking()
                .Include(u => u.Perfil)
                .FirstOrDefaultAsync(c => c.Email == model.Email);

            if (usuarioDb is null || !BCrypt.Net.BCrypt.Verify(model.Senha, usuarioDb.Senha))
                return Unauthorized(new { message = "Email ou senha incorretos" });

            var jwt = GenerateJwtToken(usuarioDb);

            var response = new LoginResponseDto
            {
                JwtToken = jwt,
                Usuario = new UsuarioDto
                {
                    Id = usuarioDb.Id,
                    NomeCompleto = usuarioDb.NomeCompleto,
                    Email = usuarioDb.Email,
                    IdPerfil = usuarioDb.IdPerfil,
                    IdEmpresaPrestadora = usuarioDb.IdEmpresaPrestadora
                }
            };

            return Ok(response);
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

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
                return Unauthorized();

            var usuario = await _context.Usuarios.AsNoTracking()
                .Include(u => u.Perfil)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (usuario == null)
                return NotFound();

            var usuarioDto = new UsuarioDto
            {
                Id = usuario.Id,
                NomeCompleto = usuario.NomeCompleto,
                Email = usuario.Email,
                IdPerfil = usuario.IdPerfil,
                IdEmpresaPrestadora = usuario.IdEmpresaPrestadora
            };

            return Ok(usuarioDto);
        }

        [HttpPost("recoverPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> RecoverPassword(string? email)
        {
            //Verifica se o parametro recebido é nulo e se tem as
            // caracteristicas de um Email.
            if (string.IsNullOrEmpty(email))
                return Unauthorized();
            if (!(email.Contains("@") && email.ToUpper().Contains(".COM")))
                return StatusCode(422, "Dados de email inválidos");

            var user = await _context.Usuarios
                .AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return StatusCode(422, "Usuário não cadastrado");

            EmailService emailService = new EmailService();

            try
            {
                //Envia o email e recebe senha temporaria para guardar como Cache
                string tempPassword = await emailService.SendEmail(email, user.NomeCompleto.ToString());
                //Guarda Chave Temporaria no cache
                _tempData.SetData(user.Email, tempPassword);

            }
            catch (Exception e)
            {
                Console.Error.WriteLine($"Erro no envio do email: {e}");
                return StatusCode(500, $"Erro no envio do Email");
            }

            return StatusCode(200, $"Email Enviado");
        }

        [HttpPost("resetPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword(string email, string tempPassword, string newPassword)
        {
            //Validacao para entrada dos dados
            if (string.IsNullOrEmpty(tempPassword) || string.IsNullOrEmpty(newPassword) || string.IsNullOrEmpty(email))
                return StatusCode(400, $"Dados nao fornecidos");

            var userDb = await _context.Usuarios
                .AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);

            if (userDb == null)
                return StatusCode(422, "Usuário nao pertence ao site");

            string? tempPwd = _tempData.GetData(userDb.Email);

            //Verifica password temporarios com password enviado
            if (string.IsNullOrEmpty(tempPwd) || tempPassword != tempPwd)
                return StatusCode(400, "Token invalido ou expirado");

            userDb.Senha = BCrypt.Net.BCrypt.HashPassword(newPassword);
            try
            {
                _context.Usuarios.Update(userDb);
                await _context.SaveChangesAsync();
                _tempData.RemoveData(userDb.Email);
                return StatusCode(200, $"Senha Restaurada");
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Erro na atualizacao do usuario");
            }
        }
    }
}