using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<ActionResult> GetAll()
        {
            var model = await _context.EmpresasClientes.ToListAsync();
            return Ok(model);
        }

        // GET api/Empresa/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var model = await _context.EmpresasClientes.FindAsync(id);

            if (model == null) return NotFound();

            return Ok(model);
        }

        // POST api/Empresa
        [HttpPost]
        public async Task<ActionResult<EmpresaCliente>> Create(EmpresaCliente model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            _context.EmpresasClientes.Add(model);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT api/<AsoController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<EmpresaCliente>> Update(int id, EmpresaCliente model)
        {
            if (id != model.Id) return BadRequest();

            _context.EmpresasClientes.Update(model);
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