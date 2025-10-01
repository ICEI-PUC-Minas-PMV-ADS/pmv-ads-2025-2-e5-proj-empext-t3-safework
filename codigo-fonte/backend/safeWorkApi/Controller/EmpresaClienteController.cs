using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Models;

namespace safeWorkApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpresaClienteController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmpresaClienteController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/EmpresaCliente
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var empresas = await _context.EmpresasClientes.ToListAsync();
            return Ok(empresas);
        }

        // GET api/EmpresaCliente/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var empresa = await _context.EmpresasClientes.FindAsync(id);

            if (empresa == null) return NotFound();

            return Ok(empresa);
        }

        // POST api/EmpresaCliente
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

        // PUT api/EmpresaCliente/5
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

        // DELETE api/EmpresaCliente/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var empresa = await _context.EmpresasClientes.FindAsync(id);
            if (empresa == null)
            {
                return NotFound();
            }
            _context.EmpresasClientes.Remove(empresa);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
