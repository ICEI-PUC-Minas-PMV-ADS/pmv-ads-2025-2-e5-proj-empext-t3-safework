using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;
using safeWorkApi.utils.Controller;

namespace safeWorkApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpresaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Filters _filters;

        public EmpresaController(AppDbContext context, Filters filters)
        {
            _context = context;
            _filters = filters;
        }

        // GET: api/Empresa
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpresaClienteDTO>>> GetAll()
        {

            var result = await _filters.FiltrarEmpresasPorContrato(User);

            if (result.Result != null)
            {
                return result.Result;
            }
            var colaboradores = result.Value;

            List<EmpresaClienteDTO> empresaClienteDTO = colaboradores.Select(m => new EmpresaClienteDTO
            {
                Id = m.Id,
                TipoPessoa = m.TipoPessoa,
                CpfCnpj = m.CpfCnpj,
                NomeRazao = m.NomeRazao,
                NomeFantasia = m.NomeFantasia,
                Telefone = m.Telefone,
                Celular = m.Celular,
                Email = m.Email,
                Status = m.Status,
                IdEndereco = m.IdEndereco

            }).ToList();

            return Ok(empresaClienteDTO);
        }

        // GET api/Empresa/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpresaClienteDTO>> GetById(int id)
        {

            var idEmpresaPrestadoraString = User.FindFirst("IdEmpresaPrestadora")?.Value;

            // Somente Root pode não ter empresa prestadora
            if (string.IsNullOrEmpty(idEmpresaPrestadoraString))
                return Unauthorized(new { message = "Empresa prestadora não encontrada." });

            if (!int.TryParse(idEmpresaPrestadoraString, out int idEmpresaPrestadora))
                return Unauthorized(new { message = "IdEmpresaPrestadora inválido no token." });

            //Obtem o lista de Ids das empresas clientes vinculadas a empresa prestadora pelo contrato
            List<int> empresasClinetes = await _filters.VerficarEmpresasClientes(idEmpresaPrestadora);

            //Verifica se a empresa prestadora a qual o usuário pertence
            //possui vinculo com a empresa cliente vinculada ao colaborador
            if (!empresasClinetes.Contains(id))
                return Unauthorized(new
                {
                    message = "Empresa Cliente inválida não possui vinculo com essa Empresa Prestadora."
                });

            var model = await _context.EmpresasClientes
                .AsNoTracking()
                .Include(e => e.Endereco)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (model == null) return NotFound();

            EmpresaClienteDTO empresaClienteDTO = new EmpresaClienteDTO
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
                IdEndereco = model.IdEndereco
            };

            return Ok(empresaClienteDTO);
        }

        // POST api/Empresa
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<EmpresaClienteCreateDTO>> Create(EmpresaClienteCreateDTO model)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //Obtem Id da Empresa prestadora por JWT
            var idEmpresaPrestadoraString = User.FindFirst("IdEmpresaPrestadora")?.Value;

            // Somente Root pode não ter empresa prestadora
            if (string.IsNullOrEmpty(idEmpresaPrestadoraString))
                return Unauthorized(new { message = "Empresa prestadora não encontrada." });

            if (!int.TryParse(idEmpresaPrestadoraString, out int idEmpresaPrestadora))
                return Unauthorized(new { message = "IdEmpresaPrestadora inválido no token." });


            EmpresaCliente empresaCliente = new EmpresaCliente
            {
                TipoPessoa = model.TipoPessoa,
                CpfCnpj = model.CpfCnpj,
                NomeRazao = model.NomeRazao,
                NomeFantasia = model.NomeFantasia,
                Telefone = model.Telefone,
                Celular = model.Celular,
                Email = model.Email,
                Status = model.Status,
                IdEndereco = model.IdEndereco
            };

            _context.EmpresasClientes.Add(empresaCliente);
            await _context.SaveChangesAsync();

            Contrato contrato = new Contrato
            {
                Numero = model.NumeroContrato,
                DataInicio = model.DataInicioContrato,
                DataFim = model.DataFimContrato,
                StatusContrato = StatusContrato.Ativo,
                PathFile = model.PathFileContrato,
                Valor = model.ValorContrato,
                Observacoes = model.ObservacoesContrato,
                IdEmpresaCliente = empresaCliente.Id,
                IdEmpresaPrestadora = idEmpresaPrestadora
            };
            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = empresaCliente.Id }, new EmpresaClienteDTO
            {
                Id = empresaCliente.Id,
                TipoPessoa = empresaCliente.TipoPessoa,
                CpfCnpj = empresaCliente.CpfCnpj,
                NomeRazao = empresaCliente.NomeRazao,
                NomeFantasia = empresaCliente.NomeFantasia,
                Telefone = empresaCliente.Telefone,
                Celular = empresaCliente.Celular,
                Email = empresaCliente.Email,
                Status = empresaCliente.Status,
                IdEndereco = empresaCliente.IdEndereco
            });
        }

        // PUT api/<AsoController>/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<EmpresaClienteDTO>> Update(int id, EmpresaClienteDTO model)
        {
            if (id != model.Id) return BadRequest();

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var empresaCliente = await _context.EmpresasClientes.FirstOrDefaultAsync(e => e.Id == id);
            if (empresaCliente == null) return NotFound();

            empresaCliente.TipoPessoa = model.TipoPessoa;
            empresaCliente.CpfCnpj = model.CpfCnpj;
            empresaCliente.NomeRazao = model.NomeRazao;
            empresaCliente.NomeFantasia = model.NomeFantasia;
            empresaCliente.Telefone = model.Telefone;
            empresaCliente.Celular = model.Celular;
            empresaCliente.Email = model.Email;
            empresaCliente.Status = model.Status;
            empresaCliente.IdEndereco = model.IdEndereco;

            await _context.SaveChangesAsync();

            return Ok(model);
        }

        // DELETE api/<AsoController>/5
        [Authorize]
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


        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Nenhum arquivo foi enviado");

            if (file.ContentType != "application/pdf")
                return BadRequest("Apenas arquivos PDF são permitidos");

            // Upload para Azure Blob Storage
            // var blobUrl = await _blobService.UploadFileAsync(file);

            // return Ok(new { url = blobUrl });
            return Ok();
        }
    }
}