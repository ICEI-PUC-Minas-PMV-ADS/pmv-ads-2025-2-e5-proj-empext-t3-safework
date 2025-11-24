using System.Security.Claims;
using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Models;
using safeWorkApi.utils.Controller;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

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

        private async Task<ActionResult<bool>> ColaboradorEDaMesmaEmpresa(Aso model)
        {
            var result = await _filters.FiltrarColaboradoresPorContrato(User);

            if (result.Result != null)
            {
                return result.Result;
            }
            var colaboradores = result.Value;

            // Verifica se o colaborador do ASO pertence ao conjunto filtrado
            var colaborador = colaboradores
                .FirstOrDefault(c => c.Id == model.IdColaborador);

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
        public async Task<ActionResult> GetAll()
        {
            var result = await _filters.FiltrarColaboradoresPorContrato(User);

            if (result.Result != null)
            {
                return result.Result;
            }

            if (result.Value == null)
                return NotFound();

            var asos = result.Value;

            return Ok(asos.ToList());
        }

        // GET api/Aso/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var model = await _context.Asos.FindAsync(id);

            if (model == null) return NotFound();

            return Ok(model);
        }

        // POST api/<AsoController>
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Aso>> Create(Aso model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await ColaboradorEDaMesmaEmpresa(model);

            if (result.Result != null)
            {
                return result.Result;
            }

            _context.Asos.Add(model);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT api/<AsoController>/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<Aso>> Update(int id, Aso model)
        {
            if (id != model.Id) return BadRequest();

            var result = await _filters.FiltrarColaboradoresPorContrato(User);

            if (result.Result != null)
            {
                return result.Result;
            }
            var colaboradores = result.Value;

            // Verifica se o colaborador do ASO pertence ao conjunto filtrado
            var colaborador = colaboradores
                .FirstOrDefault(c => c.Id == model.IdColaborador);

            if (colaborador == null)
            {
                return Unauthorized(new
                {
                    message = "Colaborador não pertence à empresa ou contrato do usuário."
                });
            }

            _context.Asos.Update(model);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(model);
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

            var result = await _filters.FiltrarColaboradoresPorContrato(User);

            if (result.Result != null)
            {
                return result.Result;
            }

            var colaboradores = result.Value;

            // Verifica se o colaborador do ASO pertence ao conjunto filtrado
            var colaborador = colaboradores
                .FirstOrDefault(c => c.Id == model.IdColaborador);

            if (colaborador == null)
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
