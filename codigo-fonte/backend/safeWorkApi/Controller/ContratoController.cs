using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;
using System.Linq;

namespace safeWorkApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContratoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContratoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContratoDto>>> GetAll()
        {
            var contratos = await _context.Contratos
                .AsNoTracking()
                .Include(c => c.EmpresaCliente)
                .Include(c => c.EmpresaPrestadora)
                .ToListAsync();

            return Ok(contratos.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ContratoDto>> GetById(int id)
        {
            var contrato = await _context.Contratos
                .AsNoTracking()
                .Include(c => c.EmpresaCliente)
                .Include(c => c.EmpresaPrestadora)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contrato == null)
            {
                return NotFound();
            }

            return Ok(MapToDto(contrato));
        }

        [HttpPost]
        public async Task<ActionResult<ContratoDto>> Create(ContratoCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var contrato = new Contrato
            {
                Numero = dto.Numero,
                DataInicio = dto.DataInicio,
                DataFim = dto.DataFim,
                StatusContrato = dto.StatusContrato,
                PathFile = dto.PathFile,
                Valor = dto.Valor,
                Observacoes = dto.Observacoes,
                IdEmpresaCliente = dto.IdEmpresaCliente,
                IdEmpresaPrestadora = dto.IdEmpresaPrestadora
            };

            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            await _context.Entry(contrato).Reference(c => c.EmpresaCliente).LoadAsync();
            await _context.Entry(contrato).Reference(c => c.EmpresaPrestadora).LoadAsync();

            var contratoDto = MapToDto(contrato);

            return CreatedAtAction(nameof(GetById), new { id = contrato.Id }, contratoDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ContratoDto>> Update(int id, ContratoUpdateDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest();
            }

            var contrato = await _context.Contratos.FirstOrDefaultAsync(c => c.Id == id);
            if (contrato == null)
            {
                return NotFound();
            }

            contrato.Numero = dto.Numero;
            contrato.DataInicio = dto.DataInicio;
            contrato.DataFim = dto.DataFim;
            contrato.StatusContrato = dto.StatusContrato;
            contrato.PathFile = dto.PathFile;
            contrato.Valor = dto.Valor;
            contrato.Observacoes = dto.Observacoes;
            contrato.IdEmpresaCliente = dto.IdEmpresaCliente;
            contrato.IdEmpresaPrestadora = dto.IdEmpresaPrestadora;

            await _context.SaveChangesAsync();

            await _context.Entry(contrato).Reference(c => c.EmpresaCliente).LoadAsync();
            await _context.Entry(contrato).Reference(c => c.EmpresaPrestadora).LoadAsync();

            return Ok(MapToDto(contrato));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var contrato = await _context.Contratos.FindAsync(id);
            if (contrato == null)
            {
                return NotFound();
            }

            _context.Contratos.Remove(contrato);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static ContratoDto MapToDto(Contrato contrato)
        {
            return new ContratoDto
            {
                Id = contrato.Id,
                Numero = contrato.Numero,
                DataInicio = contrato.DataInicio,
                DataFim = contrato.DataFim,
                StatusContrato = contrato.StatusContrato,
                PathFile = contrato.PathFile,
                Valor = contrato.Valor,
                Observacoes = contrato.Observacoes,
                IdEmpresaCliente = contrato.IdEmpresaCliente,
                IdEmpresaPrestadora = contrato.IdEmpresaPrestadora,
                EmpresaCliente = contrato.EmpresaCliente == null
                    ? null
                    : new EmpresaContratoResumoDto
                    {
                        Id = contrato.EmpresaCliente.Id,
                        NomeRazao = contrato.EmpresaCliente.NomeRazao,
                        CpfCnpj = contrato.EmpresaCliente.CpfCnpj
                    },
                EmpresaPrestadora = contrato.EmpresaPrestadora == null
                    ? null
                    : new EmpresaContratoResumoDto
                    {
                        Id = contrato.EmpresaPrestadora.Id,
                        NomeRazao = contrato.EmpresaPrestadora.NomeRazao,
                        CpfCnpj = contrato.EmpresaPrestadora.CpfCnpj
                    }
            };
        }
    }
}

