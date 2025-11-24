using System.Security.Claims;
using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Models;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.utils.Controller;

namespace safeWorkApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Filters _filters;

        public AsoController(AppDbContext context, Filters filters)
        {
            _context = context;
            _filters = filters;
        }

        private async Task<ActionResult<bool>> ColaboradorEDaMesmaEmpresa(int idColaborador)
        {
            var result = await _filters.FiltrarColaboradoresPorContrato(User);

            if (result.Result != null)
            {
                return result.Result;
            }
            var colaboradores = result.Value;

            // Verifica se o colaborador do ASO pertence ao conjunto filtrado
            var colaborador = colaboradores
                .FirstOrDefault(c => c.Id == idColaborador);

            if (colaborador == null)
            {
                return Unauthorized(new
                {
                    message = "Colaborador não pertence à empresa ou contrato do usuário."
                });
            }

            return true;
        }

        // GET: api/Aso
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AsoResponseDto>>> GetAll()
        {
            var result = await _filters.FiltrarAsosPorContrato(User);

            if (result.Result != null)
            {
                return result.Result;
            }

            if (result.Value == null)
                return NotFound();

            var asos = result.Value;

            var asosDto = asos.Select(a => new AsoResponseDto
            {
                TipoAso = a.TipoAso,
                DataSolicitacao = a.DataSolicitacao,
                DataValidade = a.DataValidade,
                Status = a.Status,
                PathFile = a.PathFile,
                Observacoes = a.Observacoes,
                IdColaborador = a.IdColaborador
            }).ToList();

            return Ok(asosDto);
        }

        // GET api/Aso/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<AsoResponseDto>> GetById(int id)
        {
            var model = await _context.Asos.FindAsync(id);

            if (model == null) return NotFound();

            var asoDto = new AsoResponseDto
            {
                TipoAso = model.TipoAso,
                DataSolicitacao = model.DataSolicitacao,
                DataValidade = model.DataValidade,
                Status = model.Status,
                PathFile = model.PathFile,
                Observacoes = model.Observacoes,
                IdColaborador = model.IdColaborador
            };

            return Ok(asoDto);
        }

        // POST api/<AsoController>
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<AsoResponseDto>> Create(AsoCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await ColaboradorEDaMesmaEmpresa(dto.IdColaborador);

            if (result.Result != null)
            {
                return result.Result;
            }

            if (result.Value == false)
            {
                return Unauthorized(new
                {
                    message = "Colaborador não pertence à empresa ou contrato do usuário."
                });
            }

            var model = new Aso
            {
                TipoAso = dto.TipoAso,
                DataSolicitacao = dto.DataSolicitacao,
                DataValidade = dto.DataValidade,
                Status = dto.Status,
                PathFile = dto.PathFile,
                Observacoes = dto.Observacoes,
                IdColaborador = dto.IdColaborador
            };

            _context.Asos.Add(model);
            await _context.SaveChangesAsync();

            var responseDto = new AsoResponseDto
            {
                TipoAso = model.TipoAso,
                DataSolicitacao = model.DataSolicitacao,
                DataValidade = model.DataValidade,
                Status = model.Status,
                PathFile = model.PathFile,
                Observacoes = model.Observacoes,
                IdColaborador = model.IdColaborador
            };

            return CreatedAtAction(nameof(GetById), new { id = model.Id }, responseDto);
        }

        // PUT api/<AsoController>/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<AsoResponseDto>> Update(int id, AsoCreateDto dto)
        {
            var existingAso = await _context.Asos.FindAsync(id);

            if (existingAso == null)
                return NotFound();

            var result = await ColaboradorEDaMesmaEmpresa(dto.IdColaborador);

            if (result.Result != null)
            {
                return result.Result;
            }

            if (result.Value == false)
            {
                return Unauthorized(new
                {
                    message = "Colaborador não pertence à empresa ou contrato do usuário."
                });
            }

            // Atualiza as propriedades
            existingAso.TipoAso = dto.TipoAso;
            existingAso.DataSolicitacao = dto.DataSolicitacao;
            existingAso.DataValidade = dto.DataValidade;
            existingAso.Status = dto.Status;
            existingAso.PathFile = dto.PathFile;
            existingAso.Observacoes = dto.Observacoes;
            existingAso.IdColaborador = dto.IdColaborador;

            _context.Asos.Update(existingAso);

            try
            {
                await _context.SaveChangesAsync();

                var responseDto = new AsoResponseDto
                {
                    TipoAso = existingAso.TipoAso,
                    DataSolicitacao = existingAso.DataSolicitacao,
                    DataValidade = existingAso.DataValidade,
                    Status = existingAso.Status,
                    PathFile = existingAso.PathFile,
                    Observacoes = existingAso.Observacoes,
                    IdColaborador = existingAso.IdColaborador
                };

                return Ok(responseDto);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Asos.Any(e => e.Id == id))
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
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var model = await _context.Asos.FindAsync(id);

            if (model == null)
            {
                return NotFound();
            }

            var result = await ColaboradorEDaMesmaEmpresa(model.IdColaborador);

            if (result.Result != null)
            {
                return result.Result;
            }

            if (result.Value == false)
            {
                return Unauthorized(new
                {
                    message = "Colaborador não pertence à empresa ou contrato do usuário."
                });
            }

            _context.Asos.Remove(model);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}