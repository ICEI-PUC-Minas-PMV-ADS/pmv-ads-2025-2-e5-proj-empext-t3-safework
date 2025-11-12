using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;

namespace safeWorkApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuarioController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Usuario
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll()
        {
            var usuarios = await _context.Usuarios
                .AsNoTracking()
                .ToListAsync();

            var result = usuarios.Select(MapToDto).ToList();
            return Ok(result);
        }

        // GET: api/Usuario/5
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
        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> Create(UsuarioCreateDto usuario)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newUsuario = new Usuario { };
            if (usuario.IdPerfil == 1)
            {
                //Configuracao para usuario de perfil Root
                newUsuario = new Usuario
                {
                    NomeCompleto = usuario.NomeCompleto,
                    Email = usuario.Email,
                    Senha = BCrypt.Net.BCrypt.HashPassword(usuario.Senha),
                    IdPerfil = usuario.IdPerfil,
                    IdEmpresaPrestadora = null
                };
            }
            else
            {
                //Configuracao para usuario convencional
                newUsuario = new Usuario
                {
                    NomeCompleto = usuario.NomeCompleto,
                    Email = usuario.Email,
                    Senha = BCrypt.Net.BCrypt.HashPassword(usuario.Senha),
                    IdPerfil = usuario.IdPerfil,
                    IdEmpresaPrestadora = 1 /* => Necessario alterar 
                    futuramente caso tenham mais empresas
                    de seguranca do trabalho cadastradas*/
                };
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

        // DELETE: api/Usuario/5
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