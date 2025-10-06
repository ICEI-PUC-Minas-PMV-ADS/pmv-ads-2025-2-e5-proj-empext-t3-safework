using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Models;

namespace safeWorkApi.Controller
{
    public class ColaboradoresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ColaboradoresController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Aso
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var model = await _context.Colaboradores.ToListAsync();
            return Ok(model);
        }

        // GET api/Aso/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var model = await _context.Colaboradores.FindAsync(id);

            if (model == null) return NotFound();

            return Ok(model);
        }

        // POST api/<AsoController>
        [HttpPost]
        public async Task<ActionResult<Colaborador>> Create(Colaborador model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            _context.Colaboradores.Add(model);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT api/<ColaboradoresController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Colaborador>> Update(int id, Colaborador model)
        {
            if (id != model.Id) return BadRequest();

            _context.Colaboradores.Update(model);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(model);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Colaboradores.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    return Conflict("Conflito na update do registro, tente novamente");
                }
            }
        }

        // DELETE api/<ColaboradoresController>/5
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