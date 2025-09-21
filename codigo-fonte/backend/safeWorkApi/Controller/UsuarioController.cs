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
        public async Task<ActionResult<IEnumerable<Usuario>>> GetAll()
        {
            var usuarios = await _context.Usuarios.ToListAsync();
            return Ok(usuarios);
        }

        // GET: api/Usuario/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetById(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound();
            }

            return Ok(usuario);
        }

        // POST: api/Usuario
        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> Create(UsuarioCreateDto usuario)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newUsuario = new Usuario
            {
                NomeCompleto = usuario.NomeCompleto,
                Email = usuario.Email,
                Senha = BCrypt.Net.BCrypt.HashPassword(usuario.Senha),
                IdPerfil = usuario.IdPerfil,
                IdEmpresaPrestadora = 0 /* => Necessario alterar 
                futuramente caso tenham mais empresas
                de seguranca do trabalho cadastradas*/
            };

            try
            {
                _context.Usuarios.Add(newUsuario);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = newUsuario.Id }, usuario);
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
                var modelDb = await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
                if (modelDb == null) return NotFound();

                modelDb.NomeCompleto = model.NomeCompleto;
                modelDb.Email = model.Email;
                modelDb.Senha = BCrypt.Net.BCrypt.HashPassword(model.Senha);
                modelDb.IdPerfil = model.IdPerfil;

                _context.Usuarios.Update(modelDb);
                await _context.SaveChangesAsync();
                return Ok(new { model.NomeCompleto, model.Email, model.IdPerfil });
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





    }
}