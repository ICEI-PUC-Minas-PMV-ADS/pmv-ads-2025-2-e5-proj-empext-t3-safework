using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Models;

namespace safeWorkApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpresaPrestadoraController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmpresaPrestadoraController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/EmpresaPrestadora
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var empresas = await _context.EmpresasPrestadoras.ToListAsync();
            return Ok(empresas);
        }

        // GET api/EmpresaPrestadora/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var empresa = await _context.EmpresasPrestadoras.FindAsync(id);

            if (empresa == null) return NotFound();

            return Ok(empresa);
        }

        // POST api/EmpresaPrestadora
        [HttpPost]
        public async Task<ActionResult<EmpresaPrestadora>> Create(EmpresaPrestadora model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            _context.EmpresasPrestadoras.Add(model);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT api/EmpresaPrestadora/5
        [HttpPut("{id}")]
        public async Task<ActionResult<EmpresaPrestadora>> Update(int id, EmpresaPrestadora model)
        {
            if (id != model.Id) return BadRequest();

            _context.EmpresasPrestadoras.Update(model);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(model);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.EmpresasPrestadoras.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    return Conflict("Conflito na update do registro, tente novamente");
                }
            }
        }

        // DELETE api/EmpresaPrestadora/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var empresa = await _context.EmpresasPrestadoras.FindAsync(id);
            if (empresa == null)
            {
                return NotFound();
            }
            _context.EmpresasPrestadoras.Remove(empresa);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
