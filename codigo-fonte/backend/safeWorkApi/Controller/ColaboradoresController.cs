using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;

namespace safeWorkApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class ColaboradoresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ColaboradoresController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Aso
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ColaboradorDto>>> GetAll()
        {
            var colaboradores = await _context.Colaboradores
                .AsNoTracking()
                .Include(c => c.EmpresaCliente)
                .Include(c => c.Endereco)
                .ToListAsync();

            var result = colaboradores.Select(MapToDto).ToList();

            return Ok(result);
        }

        // GET api/Aso/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ColaboradorDto>> GetById(int id)
        {
            var colaborador = await _context.Colaboradores
                .AsNoTracking()
                .Include(c => c.EmpresaCliente)
                .Include(c => c.Endereco)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (colaborador == null) return NotFound();

            return Ok(MapToDto(colaborador));
        }

        // POST api/<AsoController>
        [HttpPost]
        public async Task<ActionResult<ColaboradorDto>> Create(ColaboradorCreateDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var colaborador = new Colaborador
            {
                TipoPessoa = model.TipoPessoa,
                CpfCnpj = model.CpfCnpj,
                NomeRazao = model.NomeRazao,
                NomeFantasia = model.NomeFantasia,
                Telefone = model.Telefone,
                Celular = model.Celular,
                Email = model.Email,
                Status = model.Status,
                IdEndereco = model.IdEndereco,
                Funcao = model.Funcao,
                IdEmpresaCliente = model.IdEmpresaCliente
            };

            _context.Colaboradores.Add(colaborador);
            await _context.SaveChangesAsync();
            await _context.Entry(colaborador).Reference(c => c.EmpresaCliente).LoadAsync();
            await _context.Entry(colaborador).Reference(c => c.Endereco).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = colaborador.Id }, MapToDto(colaborador));
        }

        // PUT api/<ColaboradoresController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ColaboradorDto>> Update(int id, ColaboradorUpdateDto model)
        {
            if (id != model.Id) return BadRequest();

            var colaborador = await _context.Colaboradores.FirstOrDefaultAsync(c => c.Id == id);
            if (colaborador == null) return NotFound();

            colaborador.TipoPessoa = model.TipoPessoa;
            colaborador.CpfCnpj = model.CpfCnpj;
            colaborador.NomeRazao = model.NomeRazao;
            colaborador.NomeFantasia = model.NomeFantasia;
            colaborador.Telefone = model.Telefone;
            colaborador.Celular = model.Celular;
            colaborador.Email = model.Email;
            colaborador.Status = model.Status;
            colaborador.IdEndereco = model.IdEndereco;
            colaborador.Funcao = model.Funcao;
            colaborador.IdEmpresaCliente = model.IdEmpresaCliente;

            await _context.SaveChangesAsync();

            await _context.Entry(colaborador).Reference(c => c.EmpresaCliente).LoadAsync();
            await _context.Entry(colaborador).Reference(c => c.Endereco).LoadAsync();

            return Ok(MapToDto(colaborador));
        }

        // DELETE api/<ColaboradoresController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var colaborador = await _context.Colaboradores.FindAsync(id);
            if (colaborador == null)
            {
                return NotFound();
            }

            _context.Colaboradores.Remove(colaborador);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static ColaboradorDto MapToDto(Colaborador model)
        {
            return new ColaboradorDto
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
                IdEndereco = model.IdEndereco,
                Funcao = model.Funcao,
                IdEmpresaCliente = model.IdEmpresaCliente,
                EmpresaClienteNome = model.EmpresaCliente?.NomeRazao,
                Endereco = model.Endereco == null
                    ? null
                    : new EnderecoResumoDto
                    {
                        Id = model.Endereco.Id,
                        Logradouro = model.Endereco.Logradouro,
                        Numero = model.Endereco.Numero,
                        Complemento = model.Endereco.Complemento,
                        Bairro = model.Endereco.Bairro,
                        Municipio = model.Endereco.Municipio,
                        Uf = model.Endereco.Uf,
                        Cep = model.Endereco.Cep
                    }
            };
        }
    }
}