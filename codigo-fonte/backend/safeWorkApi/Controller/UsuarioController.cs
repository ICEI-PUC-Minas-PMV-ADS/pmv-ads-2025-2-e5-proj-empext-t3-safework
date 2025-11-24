using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;
using safeWorkApi.utils.Controller;

namespace safeWorkApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Filters _filters;

        public UsuarioController(AppDbContext context, Filters filters)
        {
            _context = context;
            _filters = filters;
        }

        // GET: api/Usuario
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll()
        {
            var result = await _filters.FiltrarUsuarioPorContrato(User);

            if (result.Result != null)
            {
                return result.Result;
            }

            var usuarios = result.Value;

            return Ok(usuarios.Select(MapToDto).ToList());
        }

        // GET: api/Usuario/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDto>> GetById(int id)
        {
            var usuario = await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null)
            {
                return NotFound();
            }

            return Ok(MapToDto(usuario));
        }

        // POST: api/Usuario
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> Create(UsuarioCreateDto usuario)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //Perfil do usuário
            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            //Validação do Perfil
            if (string.IsNullOrEmpty(perfil))
                return Unauthorized(new { message = "Perfil do usuário não encontrado." });

            var newUsuario = new Usuario { };

            if (perfil == "Root")
            {
                //Configuracao para usuario de perfil Root
                newUsuario = new Usuario
                {
                    NomeCompleto = usuario.NomeCompleto,
                    Email = usuario.Email,
                    Senha = BCrypt.Net.BCrypt.HashPassword(usuario.Senha),
                    IdPerfil = usuario.IdPerfil,
                    IdEmpresaPrestadora = usuario.IdEmpresaPrestadora
                };
            }
            else
            {
                var idEmpresaPrestadoraString = User.FindFirst("IdEmpresaPrestadora")?.Value;

                // Somente Root pode não ter empresa prestadora
                if (string.IsNullOrEmpty(idEmpresaPrestadoraString))
                    return Unauthorized(new { message = "Empresa Prestadora nao encontrada." });

                if (!int.TryParse(idEmpresaPrestadoraString, out int idEmpresaPrestadora))
                    return Unauthorized(new { message = "IdEmpresaPrestadora inválido no token." });

                if (!(idEmpresaPrestadora == usuario.IdEmpresaPrestadora))
                    return Unauthorized(new { message = "Não é possível criar um usuário para outra empresa." });

                //Perfis permitidos para criação de usuario para mesma empresa prestadora
                if (string.Equals(perfil, "Administrador")
                    || string.Equals(perfil, "Colaborador"))
                {
                    //Configuracao para usuario de perfil convencional
                    newUsuario = new Usuario
                    {
                        NomeCompleto = usuario.NomeCompleto,
                        Email = usuario.Email,
                        Senha = BCrypt.Net.BCrypt.HashPassword(usuario.Senha),
                        IdPerfil = usuario.IdPerfil,
                        IdEmpresaPrestadora = usuario.IdEmpresaPrestadora
                    };
                }
                else
                    return Unauthorized(new { message = "Perfil do usuário não encontrado." });
            }

            try
            {
                _context.Usuarios.Add(newUsuario);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = newUsuario.Id }, MapToDto(newUsuario));
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Erro na criacao do usuario {e}");
            }
        }

        // PUT: api/Usuario/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<UsuarioDto>> Update(int id, UsuarioUpdateDto model)
        {
            try
            {
                var usuarioDb = await _context.Usuarios.FirstOrDefaultAsync(c => c.Id == id);
                if (usuarioDb == null) return NotFound();

                usuarioDb.NomeCompleto = model.NomeCompleto;
                usuarioDb.Email = model.Email;
                if (!string.IsNullOrWhiteSpace(model.Senha))
                {
                    usuarioDb.Senha = BCrypt.Net.BCrypt.HashPassword(model.Senha);
                }
                usuarioDb.IdPerfil = model.IdPerfil;

                await _context.SaveChangesAsync();
                return Ok(MapToDto(usuarioDb));
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Erro na atualizacao do usuario {e.Message}");
            }
        }

        // DELETE: api/Usuario/5]
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static UsuarioDto MapToDto(Usuario usuario)
        {
            return new UsuarioDto
            {
                Id = usuario.Id,
                NomeCompleto = usuario.NomeCompleto ?? string.Empty,
                Email = usuario.Email,
                IdPerfil = usuario.IdPerfil,
                IdEmpresaPrestadora = usuario.IdEmpresaPrestadora
            };
        }
    }
}