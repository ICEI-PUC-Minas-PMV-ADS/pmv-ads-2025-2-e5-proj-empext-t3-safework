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
    public class AsoControllerTests : IDisposable
    {
        private readonly DbContextOptions<AppDbContext> _dbContextOptions;
        private readonly AppDbContext _context;

        public AsoControllerTests()
        {
            _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestAsoDatabase_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(_dbContextOptions);
        }

        private AsoController CreateController()
        {
            var filters = new Filters(_context);
            return new AsoController(_context, filters);
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

        private (EmpresaCliente empresaVinculada,
                 EmpresaCliente empresaNaoVinculada,
                 Colaborador colaboradorVinculado,
                 Colaborador colaboradorNaoVinculado)
            CriarEstruturaVinculoComContratos()
        {
            var empresaClienteVinculada = new EmpresaCliente
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente Vinculada",
                NomeFantasia = "Cli Vinc",
                Telefone = "1133334444",
                Celular = "11999998888",
                Email = "cliente.vinc@safework.com",
                Status = true,
                IdEndereco = null
            };

            var empresaClienteNaoVinculada = new EmpresaCliente
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "98765432000198",
                NomeRazao = "Empresa Cliente Não Vinculada",
                NomeFantasia = "Cli NV",
                Telefone = "1144445555",
                Celular = "11999997777",
                Email = "cliente.nv@safework.com",
                Status = true,
                IdEndereco = null
            };

            _context.EmpresasClientes.AddRange(empresaClienteVinculada, empresaClienteNaoVinculada);
            _context.SaveChanges();

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

            var colaboradorVinculado = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador Vinculado",
                NomeFantasia = "Colab V",
                Telefone = "1133331111",
                Celular = "11999990001",
                Email = "colabv@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = empresaClienteVinculada.Id
            };

            var colaboradorNaoVinculado = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "22222222000122",
                NomeRazao = "Colaborador Não Vinculado",
                NomeFantasia = "Colab NV",
                Telefone = "1144442222",
                Celular = "11999990002",
                Email = "colabnv@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Supervisor",
                IdEmpresaCliente = empresaClienteNaoVinculada.Id
            };

            _context.Colaboradores.AddRange(colaboradorVinculado, colaboradorNaoVinculado);
            _context.SaveChanges();

            return (empresaClienteVinculada, empresaClienteNaoVinculada, colaboradorVinculado, colaboradorNaoVinculado);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

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
        public async Task GetAll_WithRootRoleAndNoAsos_ReturnsEmptyList()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Root")
            });

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<AsoResponseDto>>(ok.Value);
            Assert.Empty(lista);
        }

        [Fact]
        public async Task GetAll_WithRootRoleAndAsos_ReturnsAllAsos()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Root")
            });

            var aso1 = new Aso
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date.AddDays(-10),
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso1.pdf",
                Observacoes = "ASO 1",
                IdColaborador = 1
            };

            var aso2 = new Aso
            {
                TipoAso = TipoAso.Periodico,
                DataSolicitacao = DateTime.UtcNow.Date.AddDays(-5),
                DataValidade = DateTime.UtcNow.Date.AddMonths(12),
                Status = StatusAso.Aguardando,
                PathFile = "asos/aso2.pdf",
                Observacoes = "ASO 2",
                IdColaborador = 2
            };

            _context.Asos.AddRange(aso1, aso2);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<AsoResponseDto>>(ok.Value).ToList();

            Assert.Equal(2, lista.Count);
            Assert.Contains(lista, a => a.Observacoes == "ASO 1");
            Assert.Contains(lista, a => a.Observacoes == "ASO 2");
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
        public async Task GetAll_WithAdminRoleAndContractsButNoAsos_ReturnsEmptyList()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var empresaCliente = new EmpresaCliente
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente Vinculada",
                NomeFantasia = "Cli Vinc",
                Telefone = "1133334444",
                Celular = "11999998888",
                Email = "cliente.vinc@safework.com",
                Status = true,
                IdEndereco = null
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

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<AsoResponseDto>>(ok.Value);
            Assert.Empty(lista);
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndContracts_ReturnsFilteredAsos()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var (_, _, colaboradorVinculado, colaboradorNaoVinculado) = CriarEstruturaVinculoComContratos();

            var asoVinculado = new Aso
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date.AddDays(-3),
                DataValidade = DateTime.UtcNow.Date.AddMonths(12),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-v.pdf",
                Observacoes = "ASO Vinculado",
                IdColaborador = colaboradorVinculado.Id
            };

            var asoNaoVinculado = new Aso
            {
                TipoAso = TipoAso.Periodico,
                DataSolicitacao = DateTime.UtcNow.Date.AddDays(-2),
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-nv.pdf",
                Observacoes = "ASO Não Vinculado",
                IdColaborador = colaboradorNaoVinculado.Id
            };

            _context.Asos.AddRange(asoVinculado, asoNaoVinculado);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<AsoResponseDto>>(ok.Value).ToList();

            Assert.Single(lista);
            var dto = lista[0];
            Assert.Equal("ASO Vinculado", dto.Observacoes);
            Assert.Equal(colaboradorVinculado.Id, dto.IdColaborador);
        }

        [Fact]
        public async Task GetAll_WithInvalidRole_ReturnsUnauthorized()
        {
            var controller = CreateController();

            CriarEstruturaVinculoComContratos();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "PerfilInvalido"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var result = await controller.GetAll();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Perfil do usuario nao encontrado.", message);
        }

        #endregion

        #region GetById

        [Fact]
        public async Task GetById_WhenAsoDoesNotExist_ReturnsNotFound()
        {
            var controller = CreateController();

            var result = await controller.GetById(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetById_WhenAsoExists_ReturnsOkWithDto()
        {
            var controller = CreateController();

            var aso = new Aso
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-test.pdf",
                Observacoes = "ASO Teste",
                IdColaborador = 10
            };

            _context.Asos.Add(aso);
            await _context.SaveChangesAsync();

            var result = await controller.GetById(aso.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<AsoResponseDto>(ok.Value);

            Assert.Equal(aso.TipoAso, dto.TipoAso);
            Assert.Equal(aso.DataSolicitacao, dto.DataSolicitacao);
            Assert.Equal(aso.DataValidade, dto.DataValidade);
            Assert.Equal(aso.Status, dto.Status);
            Assert.Equal(aso.PathFile, dto.PathFile);
            Assert.Equal(aso.Observacoes, dto.Observacoes);
            Assert.Equal(aso.IdColaborador, dto.IdColaborador);
        }

        #endregion

        #region Create

        [Fact]
        public async Task Create_WithInvalidModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            controller.ModelState.AddModelError("TipoAso", "Tipo ASO é obrigatório");

            var dto = new AsoCreateDto();

            var result = await controller.Create(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task Create_WithoutRoleClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso.pdf",
                Observacoes = "Teste",
                IdColaborador = 1
            };

            var result = await controller.Create(dto);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Perfil do usuário não encontrado.", message);
        }

        [Fact]
        public async Task Create_WithAdminRoleAndNoIdEmpresaPrestadora_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador")
            });

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso.pdf",
                Observacoes = "Teste",
                IdColaborador = 1
            };

            var result = await controller.Create(dto);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Empresa Prestadora nao encontrada.", message);
        }

        [Fact]
        public async Task Create_WithAdminRoleAndInvalidIdEmpresaPrestadora_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "abc")
            });

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso.pdf",
                Observacoes = "Teste",
                IdColaborador = 1
            };

            var result = await controller.Create(dto);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("IdEmpresaPrestadora inválido no token.", message);
        }

        [Fact]
        public async Task Create_WithAdminRoleAndNoContracts_ReturnsNotFound()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var colaborador = new Colaborador
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "11111111000111",
                NomeRazao = "Colaborador Teste",
                NomeFantasia = "Colab T",
                Telefone = "1133331111",
                Celular = "11999990001",
                Email = "colab@safework.com",
                Status = true,
                IdEndereco = null,
                Funcao = "Técnico",
                IdEmpresaCliente = 99
            };

            _context.Colaboradores.Add(colaborador);
            await _context.SaveChangesAsync();

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso.pdf",
                Observacoes = "Teste",
                IdColaborador = colaborador.Id
            };

            var result = await controller.Create(dto);

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal(404, notFound.StatusCode);

            var value = notFound.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Nenhum contrato encontrado para esta Empresa Prestadora.", message);
        }

        [Fact]
        public async Task Create_WithAdminRoleAndContractsButColaboradorNotLinked_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var (_, _, _, colaboradorNaoVinculado) = CriarEstruturaVinculoComContratos();

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso.pdf",
                Observacoes = "ASO Colab Não Vinculado",
                IdColaborador = colaboradorNaoVinculado.Id
            };

            var result = await controller.Create(dto);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Colaborador não pertence à empresa ou contrato do usuário.", message);
        }

        [Fact]
        public async Task Create_WithAdminRoleAndValidData_CreatesAsoAndReturnsCreated()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var (_, _, colaboradorVinculado, _) = CriarEstruturaVinculoComContratos();

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.Admissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso.pdf",
                Observacoes = "ASO Novo",
                IdColaborador = colaboradorVinculado.Id
            };

            var result = await controller.Create(dto);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(201, created.StatusCode);
            Assert.Equal(nameof(AsoController.GetById), created.ActionName);

            var responseDto = Assert.IsType<AsoResponseDto>(created.Value);
            Assert.Equal(dto.TipoAso, responseDto.TipoAso);
            Assert.Equal(dto.DataSolicitacao, responseDto.DataSolicitacao);
            Assert.Equal(dto.DataValidade, responseDto.DataValidade);
            Assert.Equal(dto.Status, responseDto.Status);
            Assert.Equal(dto.PathFile, responseDto.PathFile);
            Assert.Equal(dto.Observacoes, responseDto.Observacoes);
            Assert.Equal(dto.IdColaborador, responseDto.IdColaborador);

            var asoDb = await _context.Asos.FirstOrDefaultAsync(a => a.Observacoes == "ASO Novo");
            Assert.NotNull(asoDb);
            Assert.Equal(colaboradorVinculado.Id, asoDb!.IdColaborador);
        }

        #endregion

        #region Update

        [Fact]
        public async Task Update_WhenAsoDoesNotExist_ReturnsNotFound()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.Periodico,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(12),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-update.pdf",
                Observacoes = "Update",
                IdColaborador = 1
            };

            var result = await controller.Update(999, dto);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Update_WithColaboradorNotLinked_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var (_, _, colaboradorVinculado, colaboradorNaoVinculado) = CriarEstruturaVinculoComContratos();

            var aso = new Aso
            {
                TipoAso = TipoAso.Periodico,
                DataSolicitacao = DateTime.UtcNow.Date.AddDays(-2),
                DataValidade = DateTime.UtcNow.Date.AddMonths(6),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-antigo.pdf",
                Observacoes = "ASO Antigo",
                IdColaborador = colaboradorVinculado.Id
            };

            _context.Asos.Add(aso);
            await _context.SaveChangesAsync();

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.Periodico,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(12),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-update.pdf",
                Observacoes = "ASO Atualizado",
                IdColaborador = colaboradorNaoVinculado.Id
            };

            var result = await controller.Update(aso.Id, dto);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Colaborador não pertence à empresa ou contrato do usuário.", message);
        }

        [Fact]
        public async Task Update_WithValidData_UpdatesAndReturnsOk()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var (_, _, colaboradorVinculado, _) = CriarEstruturaVinculoComContratos();

            var aso = new Aso
            {
                TipoAso = TipoAso.Periodico,
                DataSolicitacao = DateTime.UtcNow.Date.AddDays(-5),
                DataValidade = DateTime.UtcNow.Date.AddMonths(3),
                Status = StatusAso.Aguardando,
                PathFile = "asos/aso-old.pdf",
                Observacoes = "ASO Antigo",
                IdColaborador = colaboradorVinculado.Id
            };

            _context.Asos.Add(aso);
            await _context.SaveChangesAsync();

            var dto = new AsoCreateDto
            {
                TipoAso = TipoAso.RetornoAoTrabalho,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(12),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-new.pdf",
                Observacoes = "ASO Atualizado",
                IdColaborador = colaboradorVinculado.Id
            };

            var result = await controller.Update(aso.Id, dto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var responseDto = Assert.IsType<AsoResponseDto>(ok.Value);

            Assert.Equal(dto.TipoAso, responseDto.TipoAso);
            Assert.Equal(dto.DataSolicitacao, responseDto.DataSolicitacao);
            Assert.Equal(dto.DataValidade, responseDto.DataValidade);
            Assert.Equal(dto.Status, responseDto.Status);
            Assert.Equal(dto.PathFile, responseDto.PathFile);
            Assert.Equal(dto.Observacoes, responseDto.Observacoes);
            Assert.Equal(dto.IdColaborador, responseDto.IdColaborador);

            var asoDb = await _context.Asos.FindAsync(aso.Id);
            Assert.NotNull(asoDb);
            Assert.Equal(dto.TipoAso, asoDb!.TipoAso);
            Assert.Equal(dto.DataSolicitacao, asoDb.DataSolicitacao);
            Assert.Equal(dto.DataValidade, asoDb.DataValidade);
            Assert.Equal(dto.Status, asoDb.Status);
            Assert.Equal(dto.PathFile, asoDb.PathFile);
            Assert.Equal(dto.Observacoes, asoDb.Observacoes);
            Assert.Equal(dto.IdColaborador, asoDb.IdColaborador);
        }

        #endregion

        #region Delete

        [Fact]
        public async Task Delete_WhenAsoDoesNotExist_ReturnsNotFound()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_WithColaboradorNotLinked_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var (_, _, _, colaboradorNaoVinculado) = CriarEstruturaVinculoComContratos();

            var aso = new Aso
            {
                TipoAso = TipoAso.Demissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(1),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-del.pdf",
                Observacoes = "ASO Para Deletar",
                IdColaborador = colaboradorNaoVinculado.Id
            };

            _context.Asos.Add(aso);
            await _context.SaveChangesAsync();

            var result = await controller.Delete(aso.Id);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var messageProp = value!.GetType().GetProperty("message");
            var message = messageProp!.GetValue(value)?.ToString();
            Assert.Equal("Colaborador não pertence à empresa ou contrato do usuário.", message);
        }

        [Fact]
        public async Task Delete_WithValidData_RemovesAndReturnsNoContent()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var (_, _, colaboradorVinculado, _) = CriarEstruturaVinculoComContratos();

            var aso = new Aso
            {
                TipoAso = TipoAso.Demissional,
                DataSolicitacao = DateTime.UtcNow.Date,
                DataValidade = DateTime.UtcNow.Date.AddMonths(1),
                Status = StatusAso.Valido,
                PathFile = "asos/aso-del-ok.pdf",
                Observacoes = "ASO Para Deletar OK",
                IdColaborador = colaboradorVinculado.Id
            };

            _context.Asos.Add(aso);
            await _context.SaveChangesAsync();

            var result = await controller.Delete(aso.Id);

            Assert.IsType<NoContentResult>(result);

            var asoDb = await _context.Asos.FindAsync(aso.Id);
            Assert.Null(asoDb);
        }

        #endregion
    }
}
