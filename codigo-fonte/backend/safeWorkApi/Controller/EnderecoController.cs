using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.DTOs;
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
        public async Task<ActionResult<Endereco>> Create(EnderecoCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var endereco = new Endereco
            {
                Logradouro = dto.Logradouro,
                Numero = dto.Numero,
                Complemento = dto.Complemento ?? string.Empty,
                Bairro = dto.Bairro,
                Municipio = dto.Municipio,
                Uf = dto.Uf.ToUpper(),
                Cep = dto.Cep
            };

            _context.Enderecos.Add(endereco);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = endereco.Id }, endereco);
        }

        // PUT api/Endereco/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Endereco>> Update(int id, EnderecoUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingEndereco = await _context.Enderecos.FindAsync(id);
            if (existingEndereco == null)
                return NotFound($"Endereço com ID {id} não encontrado");

            // Atualiza as propriedades
            existingEndereco.Logradouro = dto.Logradouro;
            existingEndereco.Numero = dto.Numero;
            existingEndereco.Complemento = dto.Complemento ?? string.Empty;
            existingEndereco.Bairro = dto.Bairro;
            existingEndereco.Municipio = dto.Municipio;
            existingEndereco.Uf = dto.Uf.ToUpper();
            existingEndereco.Cep = dto.Cep;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(existingEndereco);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("Conflito na atualização do registro, tente novamente");
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