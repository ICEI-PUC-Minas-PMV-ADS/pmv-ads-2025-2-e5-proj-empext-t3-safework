using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;

namespace safeWorkApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class ColaboradoresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ColaboradoresController(AppDbContext context)
        {
            _context = context;
        }

        //Retorna o nome do perfil pelo Id do Perfil recebido
        private async Task<string?> PerfilFilter(string PerfilId)
        {
            int perfilId = int.Parse(PerfilId);
            var perfil = await _context.Perfis
                .FirstOrDefaultAsync(c => c.Id == perfilId);

            if (perfil == null)
                return null;

            return perfil.NomePerfil;
        }

        //Funcao que retorna uma Lista das emprsas clientes Vinculadas a empresa prestadora
        private async Task<List<int>> VerficarEmpresasClientes(int idEmpresaPrestadora)
        {
            List<int> empresasClinetes = await _context.Contratos
                .AsNoTracking()
                .Where(c => c.IdEmpresaPrestadora == idEmpresaPrestadora)
                .Select(c => c.IdEmpresaCliente)
                .Distinct()
                .ToListAsync();

            return empresasClinetes;
        }

        // GET: api/Colaborador
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ColaboradorDto>>> GetAll()
        {

            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"{claim.Type} = {claim.Value}");
            }

            var IdPerfil = User.FindFirst("IdPerfil")?.Value;
            if (string.IsNullOrEmpty(IdPerfil))
                return Unauthorized(new { message = "Perfil do usuário não encontrado." });

            string perfil = await PerfilFilter(IdPerfil) ?? "";

            //Valida o perfil
            if (string.IsNullOrEmpty(perfil))
                return Unauthorized(new { message = "Nome do perdil do usuário não encontrado." });

            var idEmpresaPrestadoraString = User.FindFirst("IdEmpresaPrestadora")?.Value;

            // Somente Root pode não ter empresa prestadora
            if (string.IsNullOrEmpty(idEmpresaPrestadoraString)
                && !string.Equals(perfil, "Root"))
                return Unauthorized(new { message = "Empresa Prestadora nao encontrada." });

            if (!int.TryParse(idEmpresaPrestadoraString, out int idEmpresaPrestadora))
                return Unauthorized(new { message = "IdEmpresaPrestadora inválido no token." });

            //Obtem o ID das empresas clientes vinculadas a empresa prestadora
            List<int> empresasClinetes = await VerficarEmpresasClientes(idEmpresaPrestadora);

            // Verifica se nao existe um contrato que vincule
            if (!string.Equals(perfil, "Root") && empresasClinetes.Count == 0)
                return NotFound(new { message = "Nenhum contrato encontrado para esta Empresa Prestadora." });

            List<Colaborador> colaboradores;

            //Se o perfil for Administrador ou Colaborador, retororna
            //os colaboradores viculadaos a empresa pro contrato
            if (string.Equals(perfil, "Administrador")
                || string.Equals(perfil, "Colaborador"))
            {
                colaboradores = await _context.Colaboradores
                .AsNoTracking()
                .Where(c => empresasClinetes.Contains(c.IdEmpresaCliente))
                .ToListAsync();
            }
            else if (string.Equals(perfil, "Root"))
            {
                // Se ROOT retorna todos os colaboradores
                colaboradores = await _context.Colaboradores
                .AsNoTracking()
                .ToListAsync();
            }
            else
                return Unauthorized(new { message = "Perfil do usuario nao encontrado." });

            var result = colaboradores.Select(MapToDto).ToList();
            return Ok(result);
        }

        // GET api/Colaborador/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ColaboradorDto>> GetById(int id)
        {
            var colaborador = await _context.Colaboradores
                .AsNoTracking()
                .Include(c => c.EmpresaCliente)
                .Include(c => c.Endereco)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (colaborador == null) return NotFound();

            return Ok(MapToDto(colaborador));
        }

        // POST api/<AsoController>
        [HttpPost]
        public async Task<ActionResult<ColaboradorDto>> Create(ColaboradorCreateDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var colaborador = new Colaborador
            {
                TipoPessoa = model.TipoPessoa,
                CpfCnpj = model.CpfCnpj,
                NomeRazao = model.NomeRazao,
                NomeFantasia = model.NomeFantasia,
                Telefone = model.Telefone,
                Celular = model.Celular,
                Email = model.Email,
                Status = model.Status,
                IdEndereco = model.IdEndereco,
                Funcao = model.Funcao,
                IdEmpresaCliente = model.IdEmpresaCliente
            };

            _context.Colaboradores.Add(colaborador);
            await _context.SaveChangesAsync();
            await _context.Entry(colaborador).Reference(c => c.EmpresaCliente).LoadAsync();
            await _context.Entry(colaborador).Reference(c => c.Endereco).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = colaborador.Id }, MapToDto(colaborador));
        }

        // PUT api/<ColaboradoresController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ColaboradorDto>> Update(int id, ColaboradorUpdateDto model)
        {
            if (id != model.Id) return BadRequest();

            var colaborador = await _context.Colaboradores.FirstOrDefaultAsync(c => c.Id == id);
            if (colaborador == null) return NotFound();

            colaborador.TipoPessoa = model.TipoPessoa;
            colaborador.CpfCnpj = model.CpfCnpj;
            colaborador.NomeRazao = model.NomeRazao;
            colaborador.NomeFantasia = model.NomeFantasia;
            colaborador.Telefone = model.Telefone;
            colaborador.Celular = model.Celular;
            colaborador.Email = model.Email;
            colaborador.Status = model.Status;
            colaborador.IdEndereco = model.IdEndereco;
            colaborador.Funcao = model.Funcao;
            colaborador.IdEmpresaCliente = model.IdEmpresaCliente;

            await _context.SaveChangesAsync();

            await _context.Entry(colaborador).Reference(c => c.EmpresaCliente).LoadAsync();
            await _context.Entry(colaborador).Reference(c => c.Endereco).LoadAsync();

            return Ok(MapToDto(colaborador));
        }

        // DELETE api/<ColaboradoresController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var colaborador = await _context.Colaboradores.FindAsync(id);
            if (colaborador == null)
            {
                return NotFound();
            }

            _context.Colaboradores.Remove(colaborador);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static ColaboradorDto MapToDto(Colaborador model)
        {
            return new ColaboradorDto
            {
                Id = model.Id,
                TipoPessoa = model.TipoPessoa,
                CpfCnpj = model.CpfCnpj,
                NomeRazao = model.NomeRazao,
                NomeFantasia = model.NomeFantasia,
                Telefone = model.Telefone,
                Celular = model.Celular,
                Email = model.Email,
                Status = model.Status,
                IdEndereco = model.IdEndereco,
                Funcao = model.Funcao,
                IdEmpresaCliente = model.IdEmpresaCliente,
                EmpresaClienteNome = model.EmpresaCliente?.NomeRazao,
                Endereco = model.Endereco == null
                    ? null
                    : new EnderecoResumoDto
                    {
                        Id = model.Endereco.Id,
                        Logradouro = model.Endereco.Logradouro,
                        Numero = model.Endereco.Numero,
                        Complemento = model.Endereco.Complemento,
                        Bairro = model.Endereco.Bairro,
                        Municipio = model.Endereco.Municipio,
                        Uf = model.Endereco.Uf,
                        Cep = model.Endereco.Cep
                    }
            };
        }
    }
}