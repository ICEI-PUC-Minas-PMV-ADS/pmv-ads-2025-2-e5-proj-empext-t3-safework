using System.Linq;
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
        public async Task<ActionResult<IEnumerable<EmpresaClienteDTO>>> GetAll()
        {
            var model = await _context.EmpresasClientes
                .AsNoTracking()
                .Include(e => e.Endereco)
                .ToListAsync();

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

            var model = await _context.EmpresasClientes
                .AsNoTracking()
                .Include(e => e.Endereco)
                .FirstOrDefaultAsync(e => e.Id == id);

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
            return CreatedAtAction(nameof(GetById), new { id = empresaCliente.Id }, new EmpresaClienteDTO
            {
                Id = empresaCliente.Id,
                TipoPessoa = empresaCliente.TipoPessoa,
                CpfCnpj = empresaCliente.CpfCnpj,
                NomeRazao = empresaCliente.NomeRazao,
                NomeFantasia = empresaCliente.NomeFantasia,
                Telefone = empresaCliente.Telefone,
                Celular = empresaCliente.Celular,
                Email = empresaCliente.Email,
                Status = empresaCliente.Status,
                IdEndereco = empresaCliente.IdEndereco
            });
        }

        // PUT api/<AsoController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<EmpresaClienteDTO>> Update(int id, EmpresaClienteDTO model)
        {
            if (id != model.Id) return BadRequest();

            var empresaCliente = await _context.EmpresasClientes.FirstOrDefaultAsync(e => e.Id == id);
            if (empresaCliente == null) return NotFound();

            empresaCliente.TipoPessoa = model.TipoPessoa;
            empresaCliente.CpfCnpj = model.CpfCnpj;
            empresaCliente.NomeRazao = model.NomeRazao;
            empresaCliente.NomeFantasia = model.NomeFantasia;
            empresaCliente.Telefone = model.Telefone;
            empresaCliente.Celular = model.Celular;
            empresaCliente.Email = model.Email;
            empresaCliente.Status = model.Status;
            empresaCliente.IdEndereco = model.IdEndereco;

            await _context.SaveChangesAsync();

            return Ok(model);
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