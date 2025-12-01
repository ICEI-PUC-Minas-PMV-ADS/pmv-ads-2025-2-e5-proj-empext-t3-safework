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

        private void SeedDatabase()
        {
            var perfil = new Perfil { Id = 1, NomePerfil = "Root" };

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

        #region Login

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
            var controller = CreateController();
            var model = new AuthenticateDto { Email = "", Senha = "" };


            var result = await controller.Login(model);

            var resultUnauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, resultUnauthorized.StatusCode);

            var message = GetMessageFromResult(resultUnauthorized);
            Assert.Equal("Email e senha são obrigatórios", message);

        }

        [Fact]
        public async Task Login_WithNonExistentUser_ReturnsUnauthorized()
        {
            var controller = CreateController();
            var model = new AuthenticateDto { Email = "inexistente@email.com", Senha = "1234" };

            var result = await controller.Login(model);

            var resultUnauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, resultUnauthorized.StatusCode);

            var message = GetMessageFromResult(resultUnauthorized);
            Assert.Equal("Email ou senha incorretos", message);

        }

        [Fact]
        public async Task Login_WithWrongPassword_ReturnsUnauthorized()
        {
            var controller = CreateController();
            var model = new AuthenticateDto { Email = "uteste@email.com", Senha = "errada" };

            var result = await controller.Login(model);

            var resultUnauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, resultUnauthorized.StatusCode);

            var message = GetMessageFromResult(resultUnauthorized);
            Assert.Equal("Email ou senha incorretos", message);

        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkWithToken()
        {
            var controller = CreateController();
            var model = new AuthenticateDto { Email = "uteste@email.com", Senha = "teste1234" };

            var result = await controller.Login(model);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<LoginResponseDto>(okResult.Value);

            Assert.NotNull(response.jwtToken);
            Assert.NotNull(response.usuario);

            Assert.Equal("uteste@email.com", response.usuario.Email);
            Assert.Equal("Usuario Teste", response.usuario.NomeCompleto);

        }

        #endregion

        #region GetCurrentUser

        [Fact]
        public async Task GetCurrentUser_WithoutAuthentication_ReturnsUnauthorized()
        {
            var controller = CreateController();
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await controller.GetCurrentUser();

            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task GetCurrentUser_WithValidEmailClaim_ReturnsUser()
        {
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

            var result = await controller.GetCurrentUser();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var usuarioDto = Assert.IsType<UsuarioDto>(okResult.Value);

            Assert.Equal("uteste@email.com", usuarioDto.Email);
            Assert.Equal("Usuario Teste", usuarioDto.NomeCompleto);
        }

        [Fact]
        public async Task GetCurrentUser_WithNonExistentEmail_ReturnsNotFound()
        {
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

            var result = await controller.GetCurrentUser();

            Assert.IsType<NotFoundResult>(result);
        }

        #endregion

        #region GenerateJwtToken

        [Fact]
        public void GenerateJwtToken_WithValidUser_ReturnsValidToken()
        {
            var controller = CreateController();
            var usuario = new Usuario
            {
                Email = "utest@email.com",
                IdPerfil = 1,
                Perfil = new Perfil
                {
                    Id = 1,
                    NomePerfil = "Root"
                }
            };

            var methodInfo = typeof(LoginController).GetMethod("GenerateJwtToken",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            var token = methodInfo?.Invoke(controller, new object[] { usuario }) as string;

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
            Assert.Equal("Root", principal.FindFirst(ClaimTypes.Role)?.Value);
        }

        #endregion

        #region GetMessageFromResult
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

        #endregion

        #region RecoverPassword

        [Fact]
        public async Task RecoverPassword_WithNullEmail_ReturnsUnauthorized()
        {
            var controller = CreateController();
            string? email = null;

            var result = await controller.RecoverPassword(email);

            var unauthorizedResult = Assert.IsType<UnauthorizedResult>(result);
            Assert.Equal(401, unauthorizedResult.StatusCode);
        }


        [Fact]
        public async Task RecoverPassword_WithInvalidEmailFormat_ReturnsUnprocessableEntity()
        {
            var controller = CreateController();
            var email = "email-invalido";

            var result = await controller.RecoverPassword(email);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(422, objectResult.StatusCode);

            var message = Assert.IsType<string>(objectResult.Value);
            Assert.Equal("Dados de email inválidos", message);
        }


        [Fact]
        public async Task RecoverPassword_WithNonExistentUser_ReturnsUnprocessableEntity()
        {
            var controller = CreateController();
            var email = "usuario.naoexiste@gmail.com";

            var result = await controller.RecoverPassword(email);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(422, objectResult.StatusCode);

            var message = Assert.IsType<string>(objectResult.Value);
            Assert.Equal("Usuário não cadastrado", message);
        }

        #endregion

        #region ResetPassword

        [Fact]
        public async Task ResetPassword_WithNullModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            var result = await controller.ResetPassword(null!);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, objectResult.StatusCode);
            var message = Assert.IsType<string>(objectResult.Value);
            Assert.Equal("Dados não fornecidos", message);
        }

        [Fact]
        public async Task ResetPassword_WithNonExistingUser_ReturnsUnprocessableEntity()
        {
            var controller = CreateController();
            var model = new ResetPasswordDto
            {
                Email = "naoexiste@safework.com",
                TempPassword = "abc123",
                NewPassword = "novaSenha123"
            };

            var result = await controller.ResetPassword(model);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(422, objectResult.StatusCode);
            var message = Assert.IsType<string>(objectResult.Value);
            Assert.Equal("Usuário não pertence ao site", message);
        }

        [Fact]
        public async Task ResetPassword_WithInvalidTempPassword_ReturnsBadRequest()
        {
            var controller = CreateController();
            var model = new ResetPasswordDto
            {
                Email = "uteste@email.com",
                TempPassword = "tokenErrado",
                NewPassword = "novaSenha123"
            };

            var result = await controller.ResetPassword(model);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(400, objectResult.StatusCode);
            var message = Assert.IsType<string>(objectResult.Value);
            Assert.Equal("Token inválido ou expirado", message);
        }

        [Fact]
        public async Task ResetPassword_WithValidData_UpdatesPasswordAndReturnsOk()
        {
            var controller = CreateController();
            var email = "uteste@email.com";
            var tempPassword = "token123";
            var newPassword = "SenhaNova123";

            var tempDataField = typeof(LoginController).GetField(
                "_tempData",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            Assert.NotNull(tempDataField);

            var tempDataService = Assert.IsType<TempDataService>(
                tempDataField.GetValue(controller));

            tempDataService.SetData(email, tempPassword);

            var model = new ResetPasswordDto
            {
                Email = email,
                TempPassword = tempPassword,
                NewPassword = newPassword
            };

            var result = await controller.ResetPassword(model);

            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objectResult.StatusCode);
            var message = Assert.IsType<string>(objectResult.Value);
            Assert.Equal("Senha Restaurada", message);

            var userDb = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
            Assert.NotNull(userDb);
            Assert.True(BCrypt.Net.BCrypt.Verify(newPassword, userDb!.Senha));

            var tempAfter = tempDataService.GetData(email);
            Assert.True(string.IsNullOrEmpty(tempAfter));
        }

        #endregion
    }
}