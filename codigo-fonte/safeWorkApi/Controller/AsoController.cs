using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace safeWorkApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AsoController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Aso
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var model = await _context.Asos.ToListAsync();
            return Ok(model);
        }

        // GET api/Aso/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var model = await _context.Asos.FindAsync(id);

            if (model == null) return NotFound();

            return Ok(model);
        }

        // POST api/<AsoController>
        [HttpPost]
        public async Task<ActionResult<Aso>> Create(Aso model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            _context.Asos.Add(model);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT api/<AsoController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Aso>> Update(int id, Aso model)
        {
            if (id != model.Id)
            {
                return BadRequest();
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
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var model = await _context.Asos.FindAsync(id);
            if (model == null)
            {
                return NotFound();
            }
            _context.Asos.Remove(model);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
