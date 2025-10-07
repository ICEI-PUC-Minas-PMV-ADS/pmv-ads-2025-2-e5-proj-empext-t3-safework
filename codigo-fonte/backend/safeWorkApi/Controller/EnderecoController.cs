using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Models;

namespace safeWorkApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnderecoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnderecoController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Endereco
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var model = await _context.Enderecos.ToListAsync();
            return Ok(model);
        }

        // GET api/Endereco/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var model = await _context.Enderecos.FindAsync(id);

            if (model == null) return NotFound();

            return Ok(model);
        }

        // POST api/Endereco
        [HttpPost]
        public async Task<ActionResult<Endereco>> Create(Endereco model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            _context.Enderecos.Add(model);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT api/Endereco/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Endereco>> Update(int id, Endereco model)
        {
            if (id != model.Id) return BadRequest();

            _context.Enderecos.Update(model);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(model);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Enderecos.Any(e => e.Id == id))
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
            var model = await _context.Enderecos.FindAsync(id);
            if (model == null)
            {
                return NotFound();
            }
            _context.Enderecos.Remove(model);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET api/Endereco/cep/12345-678
        [HttpGet("cep/{cep}")]
        public async Task<ActionResult> GetByCep(string cep)
        {
            var cepLimpo = cep.Replace("-", "").Replace(" ", "");
            
            var endereco = await _context.Enderecos
                .FirstOrDefaultAsync(e => e.Cep.Replace("-", "").Replace(" ", "") == cepLimpo);

            if (endereco == null) 
            {
                return NotFound($"Endereço com CEP {cep} não encontrado.");
            }

            return Ok(endereco);
        }
    }
}