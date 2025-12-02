using Xunit;
using System;
using safeWorkApi.Models;
using safeWorkApi.Controller;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using safeWorkApi.Dominio.DTOs;
using Microsoft.AspNetCore.Http;
using safeWorkApi.utils.Controller;
using Microsoft.EntityFrameworkCore;

namespace safeWorkTests.Controller
{
    public class EmpresaControllerTests : IDisposable
    {
        private readonly DbContextOptions<AppDbContext> _dbContextOptions;
        private readonly AppDbContext _context;

        public EmpresaControllerTests()
        {
            _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestEmpresaDatabase_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(_dbContextOptions);
        }

        private EmpresaController CreateController()
        {
            var filters = new Filters(_context);
            return new EmpresaController(_context, filters);
        }

        private void SetUserWithClaims(ControllerBase controller, IEnumerable<Claim> claims)
        {
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };
        }

        #region Delete

        [Fact]
        public async Task Delete_WithNonExistingId_ReturnsNotFound()
        {
            var controller = CreateController();
            var NonExistingId = 999;

            var result = await controller.Delete(NonExistingId);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_WithExistingId_RemovesEntityAndReturnsNoContent()
        {
            var controller = CreateController();

            var empresa = new EmpresaCliente
            {
                Id = 1,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Teste",
                NomeFantasia = "Empresa Teste",
                Status = true
            };

            _context.EmpresasClientes.Add(empresa);
            await _context.SaveChangesAsync();

            var result = await controller.Delete(empresa.Id);

            Assert.IsType<NoContentResult>(result);

            var deleted = await _context.EmpresasClientes.FindAsync(empresa.Id);
            Assert.Null(deleted);
        }

        #endregion

        #region GetById

        [Fact]
        public async Task GetById_WithoutIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await controller.GetById(1);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Empresa prestadora não encontrada.", message);
        }

        [Fact]
        public async Task GetById_WithInvalidIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim("IdEmpresaPrestadora", "abc")
            });

            var result = await controller.GetById(1);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("IdEmpresaPrestadora inválido no token.", message);
        }

        [Fact]
        public async Task GetById_WithUnlinkedEmpresaCliente_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim("IdEmpresaPrestadora", "1")
            });

            var empresaId = 10;

            var result = await controller.GetById(empresaId);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Empresa Cliente inválida não possui vinculo com essa Empresa Prestadora.", message);
        }

        [Fact]
        public async Task GetById_WithLinkedEmpresaCliente_ReturnsOkWithDto()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim("IdEmpresaPrestadora", "1")
            });

            var empresaId = 10;

            var empresaCliente = new EmpresaCliente
            {
                Id = empresaId,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente Teste",
                NomeFantasia = "Empresa Cliente Teste",
                Telefone = "1133334444",
                Celular = "11999998888",
                Email = "cliente@safework.com",
                Status = true
            };

            var contrato = new Contrato
            {
                Id = 1,
                Numero = "CTR-001",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                Valor = 1000m,
                IdEmpresaCliente = empresaId,
                IdEmpresaPrestadora = 1
            };

            _context.EmpresasClientes.Add(empresaCliente);
            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            var result = await controller.GetById(empresaId);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var dto = Assert.IsType<EmpresaClienteDTO>(ok.Value);
            Assert.Equal(empresaId, dto.Id);
            Assert.Equal("Empresa Cliente Teste", dto.NomeRazao);
            Assert.Equal("cliente@safework.com", dto.Email);
        }

        #endregion

        #region GetAll

        [Fact]
        public async Task GetAll_WithoutRoleClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await controller.GetAll();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Perfil do usuário não encontrado.", message);
        }

        [Fact]
        public async Task GetAll_WithRootRole_ReturnsAllEmpresas()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Root")
            });

            var empresa1 = new EmpresaCliente
            {
                Id = 1,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Empresa 1",
                NomeFantasia = "Emp 1",
                Telefone = "1133334444",
                Celular = "11999990001",
                Email = "emp1@safework.com",
                Status = true
            };

            var empresa2 = new EmpresaCliente
            {
                Id = 2,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "22222222000122",
                NomeRazao = "Empresa 2",
                NomeFantasia = "Emp 2",
                Telefone = "1144445555",
                Celular = "11999990002",
                Email = "emp2@safework.com",
                Status = true
            };

            _context.EmpresasClientes.AddRange(empresa1, empresa2);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var list = Assert.IsType<List<EmpresaClienteDTO>>(ok.Value);
            Assert.Equal(2, list.Count);
            Assert.Contains(list, e => e.Id == 1 && e.NomeRazao == "Empresa 1");
            Assert.Contains(list, e => e.Id == 2 && e.NomeRazao == "Empresa 2");
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndNoContracts_ReturnsNotFound()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var result = await controller.GetAll();

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal(404, notFound.StatusCode);

            var value = notFound.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Nenhum contrato encontrado para esta Empresa Prestadora.", message);
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndContracts_ReturnsFilteredEmpresas()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var empresaVinculada = new EmpresaCliente
            {
                Id = 10,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Vinculada",
                NomeFantasia = "Emp Vinc",
                Telefone = "1133334444",
                Celular = "11999998888",
                Email = "vinculada@safework.com",
                Status = true
            };

            var empresaNaoVinculada = new EmpresaCliente
            {
                Id = 20,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "98765432000198",
                NomeRazao = "Empresa Não Vinculada",
                NomeFantasia = "Emp NV",
                Telefone = "1144445555",
                Celular = "11999997777",
                Email = "naovinculada@safework.com",
                Status = true
            };

            var contrato = new Contrato
            {
                Id = 1,
                Numero = "CTR-001",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                Valor = 1000m,
                IdEmpresaCliente = empresaVinculada.Id,
                IdEmpresaPrestadora = 1
            };

            _context.EmpresasClientes.AddRange(empresaVinculada, empresaNaoVinculada);
            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var list = Assert.IsType<List<EmpresaClienteDTO>>(ok.Value);
            Assert.Single(list);

            var dto = list[0];
            Assert.Equal(empresaVinculada.Id, dto.Id);
            Assert.Equal("Empresa Vinculada", dto.NomeRazao);
            Assert.Equal("vinculada@safework.com", dto.Email);
        }

        #endregion

        #region Create

        [Fact]
        public async Task Create_WithInvalidModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            controller.ModelState.AddModelError("TipoPessoa", "TipoPessoa é obrigatório");

            var model = new EmpresaClienteCreateDTO();

            var result = await controller.Create(model);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task Create_WithoutIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var model = new EmpresaClienteCreateDTO
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Teste",
                Email = "empresa@safework.com",
                Status = true,
                DataInicioContrato = DateTime.UtcNow.Date,
                DataFimContrato = DateTime.UtcNow.Date.AddYears(1),
                NumeroContrato = "CTR-001",
                ValorContrato = 1000m
            };

            var result = await controller.Create(model);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Empresa prestadora não encontrada.", message);
        }

        [Fact]
        public async Task Create_WithInvalidIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim("IdEmpresaPrestadora", "abc")
            });

            var model = new EmpresaClienteCreateDTO
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Teste",
                Email = "empresa@safework.com",
                Status = true,
                DataInicioContrato = DateTime.UtcNow.Date,
                DataFimContrato = DateTime.UtcNow.Date.AddYears(1),
                NumeroContrato = "CTR-001",
                ValorContrato = 1000m
            };

            var result = await controller.Create(model);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("IdEmpresaPrestadora inválido no token.", message);
        }

        [Fact]
        public async Task Create_WithValidData_CreatesEmpresaAndContrato_ReturnsCreated()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim("IdEmpresaPrestadora", "1")
            });

            var dataInicio = DateTime.UtcNow.Date;
            var dataFim = dataInicio.AddYears(1);

            var model = new EmpresaClienteCreateDTO
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente Nova",
                NomeFantasia = "Cli Nova",
                Telefone = "1133334444",
                Celular = "11999998888",
                Email = "cliente.nova@safework.com",
                Status = true,
                IdEndereco = null,
                NumeroContrato = "CTR-001",
                PathFileContrato = "contratos/ctr-001.pdf",
                ValorContrato = 1500m,
                ObservacoesContrato = "Contrato de teste",
                DataInicioContrato = dataInicio,
                DataFimContrato = dataFim
            };

            var result = await controller.Create(model);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(201, created.StatusCode);
            Assert.Equal(nameof(EmpresaController.GetById), created.ActionName);

            var dto = Assert.IsType<EmpresaClienteDTO>(created.Value);
            Assert.Equal("Empresa Cliente Nova", dto.NomeRazao);
            Assert.Equal("cliente.nova@safework.com", dto.Email);

            var empresaDb = await _context.EmpresasClientes
                .FirstOrDefaultAsync(e => e.CpfCnpj == "12345678000123");
            Assert.NotNull(empresaDb);

            var contratoDb = await _context.Contratos
                .FirstOrDefaultAsync(c => c.Numero == "CTR-001");
            Assert.NotNull(contratoDb);
            Assert.Equal(empresaDb!.Id, contratoDb!.IdEmpresaCliente);
            Assert.Equal(1, contratoDb.IdEmpresaPrestadora);
            Assert.Equal(1500m, contratoDb.Valor);
        }

        #endregion

        #region Update

        [Fact]
        public async Task Update_WithMismatchedId_ReturnsBadRequest()
        {
            var controller = CreateController();
            var model = new EmpresaClienteDTO
            {
                Id = 1,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Teste"
            };

            var result = await controller.Update(2, model);

            Assert.IsType<BadRequestResult>(result.Result);
        }

        [Fact]
        public async Task Update_WithInvalidModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            var model = new EmpresaClienteDTO
            {
                Id = 1
            };

            controller.ModelState.AddModelError("NomeRazao", "NomeRazao é obrigatório");

            var result = await controller.Update(1, model);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task Update_WithNonExistingId_ReturnsNotFound()
        {
            var controller = CreateController();

            var model = new EmpresaClienteDTO
            {
                Id = 1,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Inexistente"
            };

            var result = await controller.Update(1, model);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Update_WithValidData_UpdatesEntityAndReturnsOk()
        {
            var controller = CreateController();

            var empresaOriginal = new EmpresaCliente
            {
                Id = 1,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Empresa Original",
                NomeFantasia = "Original",
                Telefone = "1133334444",
                Celular = "11999990000",
                Email = "original@safework.com",
                Status = true,
                IdEndereco = null
            };

            _context.EmpresasClientes.Add(empresaOriginal);
            await _context.SaveChangesAsync();

            var modelAtualizado = new EmpresaClienteDTO
            {
                Id = 1,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "22222222000122",
                NomeRazao = "Empresa Atualizada",
                NomeFantasia = "Atualizada",
                Telefone = "1144445555",
                Celular = "11999991111",
                Email = "atualizada@safework.com",
                Status = false,
                IdEndereco = 5
            };

            var result = await controller.Update(1, modelAtualizado);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var dto = Assert.IsType<EmpresaClienteDTO>(ok.Value);
            Assert.Equal("Empresa Atualizada", dto.NomeRazao);
            Assert.Equal("atualizada@safework.com", dto.Email);

            var empresaDb = await _context.EmpresasClientes.FirstOrDefaultAsync(e => e.Id == 1);
            Assert.NotNull(empresaDb);
            Assert.Equal("22222222000122", empresaDb!.CpfCnpj);
            Assert.Equal("Empresa Atualizada", empresaDb.NomeRazao);
            Assert.Equal("Atualizada", empresaDb.NomeFantasia);
            Assert.Equal("1144445555", empresaDb.Telefone);
            Assert.Equal("11999991111", empresaDb.Celular);
            Assert.Equal("atualizada@safework.com", empresaDb.Email);
            Assert.False(empresaDb.Status);
            Assert.Equal(5, empresaDb.IdEndereco);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

        #endregion
    }
}