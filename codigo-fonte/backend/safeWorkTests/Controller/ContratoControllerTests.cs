using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Controller;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;
using Xunit;

namespace safeWorkTests.Controller
{
    public class ContratoControllerTests : IDisposable
    {
        private readonly DbContextOptions<AppDbContext> _dbContextOptions;
        private readonly AppDbContext _context;

        public ContratoControllerTests()
        {
            _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestContratoDatabase_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(_dbContextOptions);
        }

        private ContratoController CreateController()
        {
            return new ContratoController(_context);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

        #region Helpers

        private (EmpresaCliente cliente, EmpresaPrestadora prestadora) CriarEmpresasBasicas()
        {
            var cliente = new EmpresaCliente
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente Teste",
                NomeFantasia = "Cliente Teste",
                Status = true,
                Email = "cliente@safework.com"
            };

            var prestadora = new EmpresaPrestadora
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "98765432000198",
                NomeRazao = "Empresa Prestadora Teste",
                NomeFantasia = "Prestadora Teste",
                Status = true,
                Email = "prestadora@safework.com"
            };

            _context.EmpresasClientes.Add(cliente);
            _context.EmpresasPrestadoras.Add(prestadora);
            _context.SaveChanges();

            return (cliente, prestadora);
        }

        #endregion

        #region GetAll

        [Fact]
        public async Task GetAll_WhenNoContratos_ReturnsEmptyList()
        {
            var controller = CreateController();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<ContratoDto>>(ok.Value);

            Assert.Empty(lista);
        }

        [Fact]
        public async Task GetAll_WithContratos_ReturnsAllWithEmpresas()
        {
            var controller = CreateController();
            var (cliente, prestadora) = CriarEmpresasBasicas();

            var contrato1 = new Contrato
            {
                Numero = "CTR-001",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                PathFile = "contratos/ctr-001.pdf",
                Valor = 1000m,
                Observacoes = "Contrato 1",
                IdEmpresaCliente = cliente.Id,
                IdEmpresaPrestadora = prestadora.Id
            };

            var contrato2 = new Contrato
            {
                Numero = "CTR-002",
                DataInicio = DateTime.UtcNow.Date.AddDays(-10),
                DataFim = DateTime.UtcNow.Date.AddYears(2),
                StatusContrato = StatusContrato.Suspenso,
                PathFile = null,
                Valor = 2000m,
                Observacoes = "Contrato 2",
                IdEmpresaCliente = cliente.Id,
                IdEmpresaPrestadora = prestadora.Id
            };

            _context.Contratos.AddRange(contrato1, contrato2);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<ContratoDto>>(ok.Value).ToList();

            Assert.Equal(2, lista.Count);

            var dto1 = lista.First(c => c.Numero == "CTR-001");
            Assert.Equal(contrato1.Valor, dto1.Valor);
            Assert.Equal(cliente.Id, dto1.IdEmpresaCliente);
            Assert.Equal(prestadora.Id, dto1.IdEmpresaPrestadora);
            Assert.NotNull(dto1.EmpresaCliente);
            Assert.NotNull(dto1.EmpresaPrestadora);
            Assert.Equal(cliente.NomeRazao, dto1.EmpresaCliente!.NomeRazao);
            Assert.Equal(prestadora.NomeRazao, dto1.EmpresaPrestadora!.NomeRazao);
        }

        #endregion

        #region GetById

        [Fact]
        public async Task GetById_WhenContratoDoesNotExist_ReturnsNotFound()
        {
            var controller = CreateController();

            var result = await controller.GetById(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetById_WhenContratoExists_ReturnsOkWithDto()
        {
            var controller = CreateController();
            var (cliente, prestadora) = CriarEmpresasBasicas();

            var contrato = new Contrato
            {
                Numero = "CTR-001",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                PathFile = "contratos/ctr-001.pdf",
                Valor = 1500m,
                Observacoes = "Contrato de teste",
                IdEmpresaCliente = cliente.Id,
                IdEmpresaPrestadora = prestadora.Id
            };

            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            var result = await controller.GetById(contrato.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<ContratoDto>(ok.Value);

            Assert.Equal(contrato.Id, dto.Id);
            Assert.Equal("CTR-001", dto.Numero);
            Assert.Equal(contrato.Valor, dto.Valor);
            Assert.Equal(cliente.Id, dto.IdEmpresaCliente);
            Assert.Equal(prestadora.Id, dto.IdEmpresaPrestadora);
            Assert.NotNull(dto.EmpresaCliente);
            Assert.NotNull(dto.EmpresaPrestadora);
        }

        #endregion

        #region Create

        [Fact]
        public async Task Create_WithInvalidModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            controller.ModelState.AddModelError("Numero", "Número é obrigatório");

            var dto = new ContratoCreateDto();

            var result = await controller.Create(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task Create_WithValidData_CreatesContratoAndReturnsCreated()
        {
            var controller = CreateController();
            var (cliente, prestadora) = CriarEmpresasBasicas();

            var dataInicio = DateTime.UtcNow.Date;
            var dataFim = dataInicio.AddYears(1);

            var dto = new ContratoCreateDto
            {
                Numero = "CTR-001",
                DataInicio = dataInicio,
                DataFim = dataFim,
                StatusContrato = StatusContrato.Ativo,
                PathFile = "contratos/ctr-001.pdf",
                Valor = 2500m,
                Observacoes = "Contrato de criação",
                IdEmpresaCliente = cliente.Id,
                IdEmpresaPrestadora = prestadora.Id
            };

            var result = await controller.Create(dto);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(201, created.StatusCode);
            Assert.Equal(nameof(ContratoController.GetById), created.ActionName);

            var contratoDto = Assert.IsType<ContratoDto>(created.Value);
            Assert.Equal("CTR-001", contratoDto.Numero);
            Assert.Equal(2500m, contratoDto.Valor);
            Assert.Equal(cliente.Id, contratoDto.IdEmpresaCliente);
            Assert.Equal(prestadora.Id, contratoDto.IdEmpresaPrestadora);
            Assert.NotNull(contratoDto.EmpresaCliente);
            Assert.NotNull(contratoDto.EmpresaPrestadora);

            var contratoDb = await _context.Contratos
                .Include(c => c.EmpresaCliente)
                .Include(c => c.EmpresaPrestadora)
                .FirstOrDefaultAsync(c => c.Numero == "CTR-001");

            Assert.NotNull(contratoDb);
            Assert.Equal(dto.DataInicio, contratoDb!.DataInicio);
            Assert.Equal(dto.DataFim, contratoDb.DataFim);
            Assert.Equal(dto.Valor, contratoDb.Valor);
            Assert.Equal(cliente.Id, contratoDb.IdEmpresaCliente);
            Assert.Equal(prestadora.Id, contratoDb.IdEmpresaPrestadora);
        }

        #endregion

        #region Update

        [Fact]
        public async Task Update_WhenIdDifferentFromDtoId_ReturnsBadRequest()
        {
            var controller = CreateController();

            var dto = new ContratoUpdateDto
            {
                Id = 2,
                Numero = "CTR-002",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                Valor = 1000m,
                IdEmpresaCliente = 1,
                IdEmpresaPrestadora = 1
            };

            var result = await controller.Update(1, dto);

            Assert.IsType<BadRequestResult>(result.Result);
        }

        [Fact]
        public async Task Update_WhenContratoDoesNotExist_ReturnsNotFound()
        {
            var controller = CreateController();

            var dto = new ContratoUpdateDto
            {
                Id = 999,
                Numero = "CTR-999",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                Valor = 3000m,
                IdEmpresaCliente = 1,
                IdEmpresaPrestadora = 1
            };

            var result = await controller.Update(999, dto);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Update_WithValidData_UpdatesContratoAndReturnsOk()
        {
            var controller = CreateController();
            var (cliente, prestadora) = CriarEmpresasBasicas();

            var contrato = new Contrato
            {
                Numero = "CTR-OLD",
                DataInicio = DateTime.UtcNow.Date.AddYears(-1),
                DataFim = DateTime.UtcNow.Date,
                StatusContrato = StatusContrato.Inativo,
                PathFile = "contratos/old.pdf",
                Valor = 1000m,
                Observacoes = "Antigo",
                IdEmpresaCliente = cliente.Id,
                IdEmpresaPrestadora = prestadora.Id
            };

            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            var dto = new ContratoUpdateDto
            {
                Id = contrato.Id,
                Numero = "CTR-NEW",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(2),
                StatusContrato = StatusContrato.Ativo,
                PathFile = "contratos/new.pdf",
                Valor = 5000m,
                Observacoes = "Atualizado",
                IdEmpresaCliente = cliente.Id,
                IdEmpresaPrestadora = prestadora.Id
            };

            var result = await controller.Update(contrato.Id, dto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var contratoDto = Assert.IsType<ContratoDto>(ok.Value);

            Assert.Equal("CTR-NEW", contratoDto.Numero);
            Assert.Equal(5000m, contratoDto.Valor);
            Assert.Equal(StatusContrato.Ativo, contratoDto.StatusContrato);
            Assert.Equal("contratos/new.pdf", contratoDto.PathFile);
            Assert.Equal("Atualizado", contratoDto.Observacoes);

            var contratoDb = await _context.Contratos.FindAsync(contrato.Id);
            Assert.NotNull(contratoDb);
            Assert.Equal(dto.Numero, contratoDb!.Numero);
            Assert.Equal(dto.DataInicio, contratoDb.DataInicio);
            Assert.Equal(dto.DataFim, contratoDb.DataFim);
            Assert.Equal(dto.StatusContrato, contratoDb.StatusContrato);
            Assert.Equal(dto.PathFile, contratoDb.PathFile);
            Assert.Equal(dto.Valor, contratoDb.Valor);
            Assert.Equal(dto.Observacoes, contratoDb.Observacoes);
        }

        #endregion

        #region Delete

        [Fact]
        public async Task Delete_WhenContratoDoesNotExist_ReturnsNotFound()
        {
            var controller = CreateController();

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_WhenContratoExists_RemovesAndReturnsNoContent()
        {
            var controller = CreateController();
            var (cliente, prestadora) = CriarEmpresasBasicas();

            var contrato = new Contrato
            {
                Numero = "CTR-DEL",
                DataInicio = DateTime.UtcNow.Date,
                DataFim = DateTime.UtcNow.Date.AddYears(1),
                StatusContrato = StatusContrato.Ativo,
                PathFile = null,
                Valor = 1200m,
                Observacoes = "Para deletar",
                IdEmpresaCliente = cliente.Id,
                IdEmpresaPrestadora = prestadora.Id
            };

            _context.Contratos.Add(contrato);
            await _context.SaveChangesAsync();

            var result = await controller.Delete(contrato.Id);

            Assert.IsType<NoContentResult>(result);

            var contratoDb = await _context.Contratos.FindAsync(contrato.Id);
            Assert.Null(contratoDb);
        }

        #endregion
    }
}
