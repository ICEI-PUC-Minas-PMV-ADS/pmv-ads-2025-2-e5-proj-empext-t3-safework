using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Controller;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;
using safeWorkApi.utils.Controller;
using Xunit;

namespace safeWorkTests.Controller
{
    public class ColaboradoresControllerTests : IDisposable
    {
        private readonly DbContextOptions<AppDbContext> _dbContextOptions;
        private readonly AppDbContext _context;

        public ColaboradoresControllerTests()
        {
            _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestColaboradoresDatabase_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(_dbContextOptions);
        }

        private ColaboradoresController CreateController()
        {
            var filters = new Filters(_context);
            return new ColaboradoresController(_context, filters);
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

        public void Dispose()
        {
            _context?.Dispose();
        }

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
        public async Task GetAll_WithRootRole_ReturnsAllColaboradores()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Root")
            });

            var colab1 = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador 1",
                NomeFantasia = "Colab 1",
                Telefone = "1133334444",
                Celular = "11999990001",
                Email = "colab1@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = 10
            };

            var colab2 = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "22222222000122",
                NomeRazao = "Colaborador 2",
                NomeFantasia = "Colab 2",
                Telefone = "1144445555",
                Celular = "11999990002",
                Email = "colab2@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Supervisor",
                IdEmpresaCliente = 20
            };

            _context.Colaboradores.AddRange(colab1, colab2);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var list = Assert.IsType<List<ColaboradorDto>>(ok.Value);
            Assert.Equal(2, list.Count);
            Assert.Contains(list, c => c.NomeRazao == "Colaborador 1");
            Assert.Contains(list, c => c.NomeRazao == "Colaborador 2");
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndNoIdEmpresaPrestadora_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador")
            });

            var result = await controller.GetAll();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Empresa Prestadora nao encontrada.", message);
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndInvalidIdEmpresaPrestadora_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "abc")
            });

            var result = await controller.GetAll();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("IdEmpresaPrestadora inválido no token.", message);
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
        public async Task GetAll_WithAdminRoleAndContractsButNoColaboradores_ReturnsEmptyList()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var contrato = new Contrato
            {
                Numero = "CTR-001",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                Valor = 1000m,
                IdEmpresaCliente = 10,
                IdEmpresaPrestadora = 1
            };

            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var list = Assert.IsType<List<ColaboradorDto>>(ok.Value);
            Assert.Empty(list);
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndContracts_ReturnsFilteredColaboradores()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var empresaClienteVinculada = new EmpresaCliente
            {
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente Vinculada",
                NomeFantasia = "Cli Vinc"
            };

            var empresaClienteNaoVinculada = new EmpresaCliente
            {
                CpfCnpj = "98765432000198",
                NomeRazao = "Empresa Cliente Não Vinculada",
                NomeFantasia = "Cli NV"
            };

            _context.EmpresasClientes.AddRange(empresaClienteVinculada, empresaClienteNaoVinculada);
            await _context.SaveChangesAsync();

            var contrato = new Contrato
            {
                Numero = "CTR-001",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                Valor = 1000m,
                IdEmpresaCliente = empresaClienteVinculada.Id,
                IdEmpresaPrestadora = 1
            };

            _context.Contratos.Add(contrato);

            var colabVinculado = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador Vinculado",
                NomeFantasia = "Colab V",
                Telefone = "1133334444",
                Celular = "11999990001",
                Email = "colabv@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = empresaClienteVinculada.Id
            };

            var colabNaoVinculado = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "22222222000122",
                NomeRazao = "Colaborador Não Vinculado",
                NomeFantasia = "Colab NV",
                Telefone = "1144445555",
                Celular = "11999990002",
                Email = "colabnv@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Supervisor",
                IdEmpresaCliente = empresaClienteNaoVinculada.Id
            };

            _context.Colaboradores.AddRange(colabVinculado, colabNaoVinculado);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var list = Assert.IsType<List<ColaboradorDto>>(ok.Value);
            Assert.Single(list);
            Assert.Equal("Colaborador Vinculado", list[0].NomeRazao);
        }

        [Fact]
        public async Task GetAll_WithInvalidRole_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Visitante"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var empresaCliente = new EmpresaCliente
            {
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente",
                NomeFantasia = "Cli"
            };

            _context.EmpresasClientes.Add(empresaCliente);
            await _context.SaveChangesAsync();

            var contrato = new Contrato
            {
                Numero = "CTR-001",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                Valor = 1000m,
                IdEmpresaCliente = empresaCliente.Id,
                IdEmpresaPrestadora = 1
            };

            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Perfil do usuario nao encontrado.", message);
        }

        [Fact]
        public async Task GetById_WithNonExistingId_ReturnsNotFound()
        {
            var controller = CreateController();

            var result = await controller.GetById(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetById_WithExistingId_ReturnsOkWithDto()
        {
            var controller = CreateController();

            var endereco = new Endereco
            {
                Logradouro = "Rua Teste",
                Numero = "123",
                Bairro = "Centro",
                Municipio = "São Paulo",
                Uf = "SP",
                Cep = "01000-000",
                Complemento = "Sala 1"
            };

            var empresaCliente = new EmpresaCliente
            {
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente",
                NomeFantasia = "Cli"
            };

            _context.Enderecos.Add(endereco);
            _context.EmpresasClientes.Add(empresaCliente);
            await _context.SaveChangesAsync();

            var colaborador = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador Teste",
                NomeFantasia = "Colab",
                Telefone = "1133334444",
                Celular = "11999990000",
                Email = "colab@safework.com",
                Status = true,
                IdEndereco = endereco.Id,
                Funcao = "Técnico",
                IdEmpresaCliente = empresaCliente.Id
            };

            _context.Colaboradores.Add(colaborador);
            await _context.SaveChangesAsync();

            var result = await controller.GetById(colaborador.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var dto = Assert.IsType<ColaboradorDto>(ok.Value);
            Assert.Equal("Colaborador Teste", dto.NomeRazao);
            Assert.Equal("Empresa Cliente", dto.EmpresaClienteNome);
            Assert.NotNull(dto.Endereco);
            Assert.Equal("Rua Teste", dto.Endereco!.Logradouro);
        }

        [Fact]
        public async Task Create_WithInvalidModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            controller.ModelState.AddModelError("NomeRazao", "NomeRazao é obrigatório");

            var model = new ColaboradorCreateDto();

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

            var model = new ColaboradorCreateDto
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Colaborador Teste",
                NomeFantasia = "Colab",
                Telefone = "1133334444",
                Celular = "11999990000",
                Email = "colab@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = 10
            };

            var result = await controller.Create(model);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Empresa Prestadora nao encontrada.", message);
        }

        [Fact]
        public async Task Create_WithInvalidIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim("IdEmpresaPrestadora", "abc")
            });

            var model = new ColaboradorCreateDto
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Colaborador Teste",
                NomeFantasia = "Colab",
                Telefone = "1133334444",
                Celular = "11999990000",
                Email = "colab@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = 10
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
        public async Task Create_WithEmpresaClienteNotLinked_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim("IdEmpresaPrestadora", "1")
            });

            var empresaCliente = new EmpresaCliente
            {
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente",
                NomeFantasia = "Cli"
            };

            _context.EmpresasClientes.Add(empresaCliente);
            await _context.SaveChangesAsync();

            var model = new ColaboradorCreateDto
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador Teste",
                NomeFantasia = "Colab",
                Telefone = "1133334444",
                Celular = "11999990000",
                Email = "colab@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = empresaCliente.Id
            };

            var result = await controller.Create(model);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Empresa Cliente inválida não possui vinculo com essa Empresa Prestadora.", message);
        }

        [Fact]
        public async Task Create_WithValidData_CreatesColaboradorAndReturnsCreated()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim("IdEmpresaPrestadora", "1")
            });

            var empresaCliente = new EmpresaCliente
            {
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente",
                NomeFantasia = "Cli"
            };

            var endereco = new Endereco
            {
                Logradouro = "Rua Teste",
                Numero = "123",
                Bairro = "Centro",
                Municipio = "São Paulo",
                Uf = "SP",
                Cep = "01000-000",
                Complemento = "Sala 1"
            };

            _context.EmpresasClientes.Add(empresaCliente);
            _context.Enderecos.Add(endereco);
            await _context.SaveChangesAsync();

            var contrato = new Contrato
            {
                Numero = "CTR-001",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                Valor = 1000m,
                IdEmpresaCliente = empresaCliente.Id,
                IdEmpresaPrestadora = 1
            };

            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            var model = new ColaboradorCreateDto
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador Novo",
                NomeFantasia = "Colab Novo",
                Telefone = "1133334444",
                Celular = "11999990000",
                Email = "colabnovo@safework.com",
                Status = true,
                IdEndereco = endereco.Id,
                Funcao = "Técnico",
                IdEmpresaCliente = empresaCliente.Id
            };

            var result = await controller.Create(model);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(201, created.StatusCode);
            Assert.Equal(nameof(ColaboradoresController.GetById), created.ActionName);

            var dto = Assert.IsType<ColaboradorDto>(created.Value);
            Assert.Equal("Colaborador Novo", dto.NomeRazao);
            Assert.Equal("Empresa Cliente", dto.EmpresaClienteNome);
            Assert.NotNull(dto.Endereco);
            Assert.Equal("Rua Teste", dto.Endereco!.Logradouro);

            var colabDb = await _context.Colaboradores.FirstOrDefaultAsync(c => c.Email == "colabnovo@safework.com");
            Assert.NotNull(colabDb);
            Assert.Equal(empresaCliente.Id, colabDb!.IdEmpresaCliente);
        }

        [Fact]
        public async Task Update_WithMismatchedId_ReturnsBadRequest()
        {
            var controller = CreateController();

            var model = new ColaboradorUpdateDto
            {
                Id = 1,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Teste"
            };

            var result = await controller.Update(2, model);

            Assert.IsType<BadRequestResult>(result.Result);
        }

        [Fact]
        public async Task Update_WithNonExistingId_ReturnsNotFound()
        {
            var controller = CreateController();

            var model = new ColaboradorUpdateDto
            {
                Id = 1,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Teste"
            };

            var result = await controller.Update(1, model);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Update_WithValidData_UpdatesEntityAndReturnsOk()
        {
            var controller = CreateController();

            var colaborador = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador Original",
                NomeFantasia = "Colab Orig",
                Telefone = "1133334444",
                Celular = "11999990000",
                Email = "orig@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = 10
            };

            _context.Colaboradores.Add(colaborador);
            await _context.SaveChangesAsync();

            var model = new ColaboradorUpdateDto
            {
                Id = colaborador.Id,
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "22222222000122",
                NomeRazao = "Colaborador Atualizado",
                NomeFantasia = "Colab Atual",
                Telefone = "1144445555",
                Celular = "11999991111",
                Email = "atual@safework.com",
                Status = false,
                IdEndereco = 5,
                Funcao = "Supervisor",
                IdEmpresaCliente = 20
            };

            var result = await controller.Update(colaborador.Id, model);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(200, ok.StatusCode);

            var dto = Assert.IsType<ColaboradorDto>(ok.Value);
            Assert.Equal("Colaborador Atualizado", dto.NomeRazao);
            Assert.Equal("atual@safework.com", dto.Email);

            var colabDb = await _context.Colaboradores.FirstOrDefaultAsync(c => c.Id == colaborador.Id);
            Assert.NotNull(colabDb);
            Assert.Equal("22222222000122", colabDb!.CpfCnpj);
            Assert.Equal("Colaborador Atualizado", colabDb.NomeRazao);
            Assert.Equal("Supervisor", colabDb.Funcao);
            Assert.Equal(20, colabDb.IdEmpresaCliente);
        }

        [Fact]
        public async Task Delete_WithNonExistingId_ReturnsNotFound()
        {
            var controller = CreateController();

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_WithExistingId_RemovesEntityAndReturnsNoContent()
        {
            var controller = CreateController();

            var colaborador = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador Apagar",
                NomeFantasia = "Colab Del",
                Telefone = "1133334444",
                Celular = "11999990000",
                Email = "del@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = 10
            };

            _context.Colaboradores.Add(colaborador);
            await _context.SaveChangesAsync();

            var result = await controller.Delete(colaborador.Id);

            Assert.IsType<NoContentResult>(result);

            var colabDb = await _context.Colaboradores.FindAsync(colaborador.Id);
            Assert.Null(colabDb);
        }
    }
}
