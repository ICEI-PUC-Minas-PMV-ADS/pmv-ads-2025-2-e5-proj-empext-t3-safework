using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using safeWorkApi.Controller;
using safeWorkApi.DTOs;
using safeWorkApi.Models;
using Xunit;

namespace safeWorkTests.Controller
{
    public class EnderecoControllerTests : IDisposable
    {
        private readonly DbContextOptions<AppDbContext> _dbContextOptions;
        private readonly AppDbContext _context;

        public EnderecoControllerTests()
        {
            _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase($"TestEnderecoDatabase_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(_dbContextOptions);
        }

        private EnderecoController CreateController()
        {
            return new EnderecoController(_context);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

        #region GetAll

        [Fact]
        public async Task GetAll_WhenNoEnderecos_ReturnsEmptyList()
        {
            var controller = CreateController();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<IEnumerable<Endereco>>(ok.Value);

            Assert.Empty(list);
        }

        [Fact]
        public async Task GetAll_WhenEnderecosExist_ReturnsAllEnderecos()
        {
            var controller = CreateController();

            var e1 = new Endereco
            {
                Logradouro = "Rua A",
                Numero = "100",
                Complemento = string.Empty,
                Bairro = "Centro",
                Municipio = "São Paulo",
                Uf = "SP",
                Cep = "01001000"
            };

            var e2 = new Endereco
            {
                Logradouro = "Av B",
                Numero = "200",
                Complemento = "Bloco 2",
                Bairro = "Bairro B",
                Municipio = "Rio de Janeiro",
                Uf = "RJ",
                Cep = "20020000"
            };

            _context.Enderecos.AddRange(e1, e2);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<IEnumerable<Endereco>>(ok.Value).ToList();

            Assert.Equal(2, list.Count);
            Assert.Contains(list, x => x.Logradouro == "Rua A");
            Assert.Contains(list, x => x.Logradouro == "Av B");
        }

        #endregion

        #region GetById

        [Fact]
        public async Task GetById_WhenEnderecoDoesNotExist_ReturnsNotFound()
        {
            var controller = CreateController();

            var result = await controller.GetById(999);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetById_WhenEnderecoExists_ReturnsOkWithEndereco()
        {
            var controller = CreateController();

            var endereco = new Endereco
            {
                Logradouro = "Rua Teste",
                Numero = "123",
                Complemento = "Casa",
                Bairro = "Centro",
                Municipio = "Campinas",
                Uf = "SP",
                Cep = "13000000"
            };

            _context.Enderecos.Add(endereco);
            await _context.SaveChangesAsync();

            var result = await controller.GetById(endereco.Id);

            var ok = Assert.IsType<OkObjectResult>(result);
            var value = Assert.IsType<Endereco>(ok.Value);

            Assert.Equal(endereco.Id, value.Id);
            Assert.Equal("Rua Teste", value.Logradouro);
            Assert.Equal("123", value.Numero);
            Assert.Equal("Casa", value.Complemento);
            Assert.Equal("Campinas", value.Municipio);
            Assert.Equal("SP", value.Uf);
            Assert.Equal("13000000", value.Cep);
        }

        #endregion

        #region Create

        [Fact]
        public async Task Create_WithInvalidModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            controller.ModelState.AddModelError("Logradouro", "Logradouro é obrigatório");

            var dto = new EnderecoCreateDto();

            var result = await controller.Create(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task Create_WithValidData_CreatesEnderecoAndReturnsCreated()
        {
            var controller = CreateController();

            var dto = new EnderecoCreateDto
            {
                Logradouro = "Rua Nova",
                Numero = "50",
                Complemento = null,
                Bairro = "Bairro Novo",
                Municipio = "São Paulo",
                Uf = "sp",
                Cep = "01234000"
            };

            var result = await controller.Create(dto);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(201, created.StatusCode);
            Assert.Equal(nameof(EnderecoController.GetById), created.ActionName);

            var endereco = Assert.IsType<Endereco>(created.Value);
            Assert.Equal("Rua Nova", endereco.Logradouro);
            Assert.Equal("50", endereco.Numero);
            Assert.Equal(string.Empty, endereco.Complemento);
            Assert.Equal("Bairro Novo", endereco.Bairro);
            Assert.Equal("São Paulo", endereco.Municipio);
            Assert.Equal("SP", endereco.Uf);
            Assert.Equal("01234000", endereco.Cep);

            var enderecoDb = await _context.Enderecos.FindAsync(endereco.Id);
            Assert.NotNull(enderecoDb);
            Assert.Equal("SP", enderecoDb!.Uf);
            Assert.Equal(string.Empty, enderecoDb.Complemento);
        }

        #endregion

        #region Update

        [Fact]
        public async Task Update_WithInvalidModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            controller.ModelState.AddModelError("Logradouro", "Logradouro é obrigatório");

            var dto = new EnderecoUpdateDto
            {
                Logradouro = "",
                Numero = "",
                Complemento = null,
                Bairro = "",
                Municipio = "",
                Uf = "sp",
                Cep = "00000000"
            };

            var result = await controller.Update(1, dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task Update_WhenEnderecoDoesNotExist_ReturnsNotFoundWithMessage()
        {
            var controller = CreateController();

            var dto = new EnderecoUpdateDto
            {
                Logradouro = "Rua X",
                Numero = "10",
                Complemento = "Ap 1",
                Bairro = "Centro",
                Municipio = "Cidade",
                Uf = "SP",
                Cep = "11111111"
            };

            var result = await controller.Update(999, dto);

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal(404, notFound.StatusCode);

            var message = Assert.IsType<string>(notFound.Value);
            Assert.Equal("Endereço com ID 999 não encontrado", message);
        }

        [Fact]
        public async Task Update_WithValidData_UpdatesEnderecoAndReturnsOk()
        {
            var controller = CreateController();

            var endereco = new Endereco
            {
                Logradouro = "Rua Antiga",
                Numero = "1",
                Complemento = "Casa",
                Bairro = "Bairro Velho",
                Municipio = "Cidade Velha",
                Uf = "RJ",
                Cep = "22000000"
            };

            _context.Enderecos.Add(endereco);
            await _context.SaveChangesAsync();

            var dto = new EnderecoUpdateDto
            {
                Logradouro = "Rua Atualizada",
                Numero = "10B",
                Complemento = null,
                Bairro = "Bairro Novo",
                Municipio = "Cidade Nova",
                Uf = "sp",
                Cep = "01234567"
            };

            var result = await controller.Update(endereco.Id, dto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var atualizado = Assert.IsType<Endereco>(ok.Value);

            Assert.Equal("Rua Atualizada", atualizado.Logradouro);
            Assert.Equal("10B", atualizado.Numero);
            Assert.Equal(string.Empty, atualizado.Complemento);
            Assert.Equal("Bairro Novo", atualizado.Bairro);
            Assert.Equal("Cidade Nova", atualizado.Municipio);
            Assert.Equal("SP", atualizado.Uf);
            Assert.Equal("01234567", atualizado.Cep);

            var enderecoDb = await _context.Enderecos.FindAsync(endereco.Id);
            Assert.NotNull(enderecoDb);
            Assert.Equal("Rua Atualizada", enderecoDb!.Logradouro);
            Assert.Equal("SP", enderecoDb.Uf);
            Assert.Equal(string.Empty, enderecoDb.Complemento);
        }

        #endregion

        #region Delete

        [Fact]
        public async Task Delete_WhenEnderecoDoesNotExist_ReturnsNotFound()
        {
            var controller = CreateController();

            var result = await controller.Delete(999);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal(404, notFound.StatusCode);

            var message = Assert.IsType<string>(notFound.Value);
            Assert.Equal("Endereço não encontrado", message);
        }

        [Fact]
        public async Task Delete_WhenEnderecoInUseByEmpresaCliente_ReturnsBadRequest()
        {
            var controller = CreateController();

            var endereco = new Endereco
            {
                Logradouro = "Rua Em Uso",
                Numero = "10",
                Complemento = "",
                Bairro = "Centro",
                Municipio = "Cidade",
                Uf = "SP",
                Cep = "01001001"
            };

            _context.Enderecos.Add(endereco);
            await _context.SaveChangesAsync();

            var empresaCliente = new EmpresaCliente
            {
                TipoPessoa = TipoPessoa.Juridica,
                CpfCnpj = "12345678000123",
                NomeRazao = "Empresa Cliente",
                NomeFantasia = "Cli",
                Telefone = "1133334444",
                Celular = "11999998888",
                Email = "cliente@safework.com",
                Status = true,
                IdEndereco = endereco.Id
            };

            _context.EmpresasClientes.Add(empresaCliente);
            await _context.SaveChangesAsync();

            var result = await controller.Delete(endereco.Id);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequest.StatusCode);

            var message = Assert.IsType<string>(badRequest.Value);
            Assert.Contains("Este endereço está vinculado", message);

            var enderecoDb = await _context.Enderecos.FindAsync(endereco.Id);
            Assert.NotNull(enderecoDb);
        }

        [Fact]
        public async Task Delete_WhenEnderecoNotInUse_RemovesAndReturnsNoContent()
        {
            var controller = CreateController();

            var endereco = new Endereco
            {
                Logradouro = "Rua Deletável",
                Numero = "99",
                Complemento = "",
                Bairro = "Bairro",
                Municipio = "Cidade",
                Uf = "SP",
                Cep = "05005000"
            };

            _context.Enderecos.Add(endereco);
            await _context.SaveChangesAsync();

            var result = await controller.Delete(endereco.Id);

            Assert.IsType<NoContentResult>(result);

            var enderecoDb = await _context.Enderecos.FindAsync(endereco.Id);
            Assert.Null(enderecoDb);
        }

        #endregion

        #region GetByCep

        [Fact]
        public async Task GetByCep_WhenEnderecoDoesNotExist_ReturnsNotFoundWithMessage()
        {
            var controller = CreateController();

            var cep = "12345-678";

            var result = await controller.GetByCep(cep);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal(404, notFound.StatusCode);

            var message = Assert.IsType<string>(notFound.Value);
            Assert.Equal($"Endereço com CEP {cep} não encontrado.", message);
        }

        [Fact]
        public async Task GetByCep_WithVariousFormats_FindsEnderecoByNormalizedCep()
        {
            var controller = CreateController();

            var endereco = new Endereco
            {
                Logradouro = "Rua CEP",
                Numero = "1",
                Complemento = "",
                Bairro = "Centro",
                Municipio = "Cidade",
                Uf = "SP",
                Cep = "12345678"
            };

            _context.Enderecos.Add(endereco);
            await _context.SaveChangesAsync();

            var result = await controller.GetByCep("12345-678");

            var ok = Assert.IsType<OkObjectResult>(result);
            var value = Assert.IsType<Endereco>(ok.Value);

            Assert.Equal(endereco.Id, value.Id);
            Assert.Equal("12345678", value.Cep);
        }

        #endregion
    }
}
