using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Xunit;
using safeWorkApi.Controller;
using safeWorkApi.Dominio.DTOs;
using safeWorkApi.Models;
using safeWorkApi.service;
using Moq;
using Castle.Core.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Identity.Client;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Caching.Memory;

namespace safeWorkTests.Controller
{
    public class LoginControllerTests : IDisposable
    {
        private readonly DbContextOptions<AppDbContext> _dbContextOptions;
        private readonly AppDbContext _context;

        public LoginControllerTests()
        {
            _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDatabase_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(_dbContextOptions);
            SeedDatabase();
        }

        //Criacao dos dados para teste
        private void SeedDatabase()
        {
            var perfil = new Perfil { Id = 1, NomePerfil = "Admin" };

            var usuario = new Usuario
            {
                Id = 1,
                NomeCompleto = "Usuario Teste",
                Email = "uteste@email.com",
                Senha = BCrypt.Net.BCrypt.HashPassword("teste1234"),
                IdPerfil = 1,
                IdEmpresaPrestadora = 1,
                Perfil = perfil
            };

            _context.Perfis.Add(perfil);
            _context.Usuarios.Add(usuario);
            _context.SaveChanges();
        }

        //Limpa os dados a casa teste
        public void Dispose()
        {
            _context?.Dispose();
        }

        private LoginController CreateController()
        {
            var memoryCache = new MemoryCache(new MemoryCacheOptions());
            var tempDataService = new TempDataService(memoryCache);
            return new LoginController(_context, tempDataService);
        }

        [Fact]
        public async Task Login_WithNullModel_ReturnsUnauthorized()
        {
            var controller = CreateController();

            var result = await controller.Login(null!);

            var resultUnauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, resultUnauthorized.StatusCode);

            var message = GetMessageFromResult(resultUnauthorized);
            Assert.Equal("Email e senha são obrigatórios", message);

        }

        [Fact]
        public async Task Login_WithEmptyCredentials_ReturnsUnauthorized()
        {
            //Arrange
            var controller = CreateController();
            var model = new AuthenticateDto { Email = "", Senha = "" };


            //Act
            var result = await controller.Login(model);

            string teste = "";

            //Assert
            var resultUnauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, resultUnauthorized.StatusCode);

            //Messsage of Return(Extra)
            var message = GetMessageFromResult(resultUnauthorized);
            Assert.Equal("Email e senha são obrigatórios", message);

        }

        [Fact]
        public async Task Login_WithNonExistentUser_ReturnsUnauthorized()
        {
            //Arrange
            var controller = CreateController();
            var model = new AuthenticateDto { Email = "inexistente@email.com", Senha = "1234" };

            //Act
            var result = await controller.Login(model);

            //Assert
            var resultUnauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, resultUnauthorized.StatusCode);

            //Messsage of Return(Extra)
            var message = GetMessageFromResult(resultUnauthorized);
            Assert.Equal("Email ou senha incorretos", message);

        }

        [Fact]
        public async Task Login_WithWrongPassword_ReturnsUnauthorized()
        {
            //Arrange
            var controller = CreateController();
            var model = new AuthenticateDto { Email = "uteste@email.com", Senha = "errada" };

            //Act
            var result = await controller.Login(model);

            //Assert
            var resultUnauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, resultUnauthorized.StatusCode);

            //Messsage of Return(Extra)
            var message = GetMessageFromResult(resultUnauthorized);
            Assert.Equal("Email ou senha incorretos", message);

        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkWithToken()
        {
            //Arrange
            var controller = CreateController();
            var model = new AuthenticateDto { Email = "uteste@email.com", Senha = "teste1234" };

            //Act
            var result = await controller.Login(model);

            //Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<LoginResponseDto>(okResult.Value);

            Assert.NotNull(response.JwtToken);
            Assert.NotNull(response.Usuario);

            Assert.Equal("uteste@email.com", response.Usuario.Email);
            Assert.Equal("Usuario Teste", response.Usuario.NomeCompleto);

        }

        [Fact]
        public async Task GetCurrentUser_WithoutAuthentication_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController();
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            // Act
            var result = await controller.GetCurrentUser();

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task GetCurrentUser_WithValidEmailClaim_ReturnsUser()
        {
            // Arrange
            var controller = CreateController();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, "uteste@email.com")
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };

            // Act
            var result = await controller.GetCurrentUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var usuarioDto = Assert.IsType<UsuarioDto>(okResult.Value);

            Assert.Equal("uteste@email.com", usuarioDto.Email);
            Assert.Equal("Usuario Teste", usuarioDto.NomeCompleto);
        }

        [Fact]
        public async Task GetCurrentUser_WithNonExistentEmail_ReturnsNotFound()
        {
            // Arrange
            var controller = CreateController();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, "inexistente@email.com")
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };

            // Act
            var result = await controller.GetCurrentUser();

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void GenerateJwtToken_WithValidUser_ReturnsValidToken()
        {
            // Arrange
            var controller = CreateController();
            var usuario = new Usuario
            {
                Email = "utest@email.com",
                IdPerfil = 1
            };

            // Use reflection para acessar o método privado
            var methodInfo = typeof(LoginController).GetMethod("GenerateJwtToken",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            // Act
            var token = methodInfo?.Invoke(controller, new object[] { usuario }) as string;

            // Assert
            Assert.NotNull(token);

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("BjRxlIiDQHvTrRQM3Ke4CeS9uE3RZODH");

            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            Assert.Equal("utest@email.com", principal.FindFirst(ClaimTypes.Email)?.Value);
            Assert.Equal("1", principal.FindFirst(ClaimTypes.Role)?.Value);
        }


        //Metodo auxiliar para extrair mensagem de retorno
        private string GetMessageFromResult(UnauthorizedObjectResult result)
        {
            if (result.Value is object valueObject)
            {
                var property = valueObject.GetType().GetProperty("message");
                if (property != null)
                {
                    return property.GetValue(valueObject)?.ToString() ?? string.Empty;
                }
            }

            return string.Empty;
        }

    }
}