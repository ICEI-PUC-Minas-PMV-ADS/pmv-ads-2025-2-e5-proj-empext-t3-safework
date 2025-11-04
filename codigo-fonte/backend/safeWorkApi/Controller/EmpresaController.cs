using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;

namespace safeWorkApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpresaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmpresaController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Empresa
        [HttpGet]
        public async Task<ActionResult<EmpresaClienteDTO>> GetAll()
        {
            var model = await _context.EmpresasClientes.ToListAsync();

            List<EmpresaClienteDTO> empresaClienteDTO = model.Select(m => new EmpresaClienteDTO
            {
                Id = m.Id,
                TipoPessoa = m.TipoPessoa,
                CpfCnpj = m.CpfCnpj,
                NomeRazao = m.NomeRazao,
                NomeFantasia = m.NomeFantasia,
                Telefone = m.Telefone,
                Celular = m.Celular,
                Email = m.Email,
                Status = m.Status,
                IdEndereco = m.IdEndereco

            }).ToList();

            return Ok(empresaClienteDTO);
        }

        // GET api/Empresa/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpresaClienteDTO>> GetById(int id)
        {

            var model = await _context.EmpresasClientes.FindAsync(id);



            if (model == null) return NotFound();

            EmpresaClienteDTO empresaClienteDTO = new EmpresaClienteDTO
            {
                Id = model.Id,
                TipoPessoa = model.TipoPessoa,
                CpfCnpj = model.CpfCnpj,
                NomeRazao = model.NomeRazao,
                NomeFantasia = model.NomeFantasia,
                Telefone = model.Telefone,
                Celular = model.Celular,
                Email = model.Email,
                Status = model.Status,
                IdEndereco = model.IdEndereco
            };

            return Ok(empresaClienteDTO);
        }

        // POST api/Empresa
        [HttpPost]
        public async Task<ActionResult<EmpresaClienteCreateDTO>> Create(EmpresaClienteCreateDTO model)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (model.IdEndereco == 0)
                model.IdEndereco = null;

            EmpresaCliente empresaCliente = new EmpresaCliente
            {
                TipoPessoa = model.TipoPessoa,
                CpfCnpj = model.CpfCnpj,
                NomeRazao = model.NomeRazao,
                NomeFantasia = model.NomeFantasia,
                Telefone = model.Telefone,
                Celular = model.Celular,
                Email = model.Email,
                Status = model.Status,
                IdEndereco = model.IdEndereco
            };


            _context.EmpresasClientes.Add(empresaCliente);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = empresaCliente.Id }, model);
        }

        // PUT api/<AsoController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<EmpresaClienteDTO>> Update(int id, EmpresaClienteDTO model)
        {
            if (id != model.Id) return BadRequest();

            EmpresaCliente empresaCliente = new EmpresaCliente
            {
                TipoPessoa = model.TipoPessoa,
                CpfCnpj = model.CpfCnpj,
                NomeRazao = model.NomeRazao,
                NomeFantasia = model.NomeFantasia,
                Telefone = model.Telefone,
                Celular = model.Celular,
                Email = model.Email,
                Status = model.Status,
                IdEndereco = model.IdEndereco
            };

            _context.EmpresasClientes.Update(empresaCliente);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(model);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.EmpresasClientes.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    return Conflict("Conflito na update do registro, tente novamente");
                }
            }
        }

        // DELETE api/<AsoController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var model = await _context.EmpresasClientes.FindAsync(id);
            if (model == null)
            {
                return NotFound();
            }
            _context.EmpresasClientes.Remove(model);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}