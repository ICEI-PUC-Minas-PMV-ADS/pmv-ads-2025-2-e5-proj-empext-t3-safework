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
    public class UsuarioControllerTests : IDisposable
    {
        private readonly DbContextOptions<AppDbContext> _dbContextOptions;
        private readonly AppDbContext _context;

        public UsuarioControllerTests()
        {
            _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestUsuariosDatabase_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(_dbContextOptions);
        }

        private UsuarioController CreateController()
        {
            var filters = new Filters(_context);
            return new UsuarioController(_context, filters);
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
        public async Task GetAll_WithRootRole_ReturnsAllUsuarios()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Root")
            });

            var usuario1 = new Usuario
            {
                NomeCompleto = "Usuario 1",
                Email = "u1@safework.com",
                Senha = "hash1",
                IdPerfil = 1,
                IdEmpresaPrestadora = null
            };
            var usuario2 = new Usuario
            {
                NomeCompleto = "Usuario 2",
                Email = "u2@safework.com",
                Senha = "hash2",
                IdPerfil = 2,
                IdEmpresaPrestadora = 10
            };

            _context.Usuarios.AddRange(usuario1, usuario2);
            await _context.SaveChangesAsync();

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<UsuarioDto>>(ok.Value);

            Assert.Equal(2, lista.Count());
            Assert.Contains(lista, u => u.Email == "u1@safework.com");
            Assert.Contains(lista, u => u.Email == "u2@safework.com");
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndNoIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
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
            var message = value!.GetType().GetProperty("message")!.GetValue(value)?.ToString();
            Assert.Equal("Empresa Prestadora nao encontrada.", message);
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndInvalidIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
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
            var message = value!.GetType().GetProperty("message")!.GetValue(value)?.ToString();
            Assert.Equal("IdEmpresaPrestadora inválido no token.", message);
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndNoMatchingUsuarios_ReturnsEmptyList()
        {
            var controller = CreateController();

            _context.Usuarios.Add(new Usuario
            {
                NomeCompleto = "Outro usuario",
                Email = "outro@safework.com",
                Senha = "hash",
                IdPerfil = 2,
                IdEmpresaPrestadora = 99
            });
            await _context.SaveChangesAsync();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<UsuarioDto>>(ok.Value);

            Assert.Empty(lista);
        }

        [Fact]
        public async Task GetAll_WithAdminRoleAndMatchingUsuarios_ReturnsFilteredUsuarios()
        {
            var controller = CreateController();

            _context.Usuarios.AddRange(
                new Usuario
                {
                    NomeCompleto = "Usuario 1",
                    Email = "u1@safework.com",
                    Senha = "hash1",
                    IdPerfil = 2,
                    IdEmpresaPrestadora = 1
                },
                new Usuario
                {
                    NomeCompleto = "Usuario 2",
                    Email = "u2@safework.com",
                    Senha = "hash2",
                    IdPerfil = 2,
                    IdEmpresaPrestadora = 2
                }
            );
            await _context.SaveChangesAsync();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var result = await controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<UsuarioDto>>(ok.Value);

            var usuarios = lista.ToList();
            Assert.Single(usuarios);
            Assert.Equal("u1@safework.com", usuarios[0].Email);
            Assert.Equal(1, usuarios[0].IdEmpresaPrestadora);
        }

        [Fact]
        public async Task GetAll_WithInvalidRole_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "OutroPerfil"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var result = await controller.GetAll();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var message = value!.GetType().GetProperty("message")!.GetValue(value)?.ToString();
            Assert.Equal("Perfil do usuario nao encontrado.", message);
        }

        #endregion

        #region GetById

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

            var usuario = new Usuario
            {
                NomeCompleto = "Usuario Teste",
                Email = "teste@safework.com",
                Senha = "hash",
                IdPerfil = 2,
                IdEmpresaPrestadora = 5
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var result = await controller.GetById(usuario.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<UsuarioDto>(ok.Value);

            Assert.Equal(usuario.Id, dto.Id);
            Assert.Equal("Usuario Teste", dto.NomeCompleto);
            Assert.Equal("teste@safework.com", dto.Email);
            Assert.Equal(2, dto.IdPerfil);
            Assert.Equal(5, dto.IdEmpresaPrestadora);
        }

        #endregion

        #region Create

        [Fact]
        public async Task Create_WithInvalidModel_ReturnsBadRequest()
        {
            var controller = CreateController();

            controller.ModelState.AddModelError("Email", "Email é obrigatório");

            var model = new UsuarioCreateDto();

            var result = await controller.Create(model);

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

            var model = new UsuarioCreateDto
            {
                NomeCompleto = "Novo Usuario",
                Email = "novo@safework.com",
                Senha = "Senha123",
                IdPerfil = 2
            };

            var result = await controller.Create(model);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var message = value!.GetType().GetProperty("message")!.GetValue(value)?.ToString();
            Assert.Equal("Perfil do usuário não encontrado.", message);
        }

        [Fact]
        public async Task Create_WithInvalidRole_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "PerfilInvalido"),
                new Claim("IdEmpresaPrestadora", "1")
            });

            var model = new UsuarioCreateDto
            {
                NomeCompleto = "Novo Usuario",
                Email = "novo@safework.com",
                Senha = "Senha123",
                IdPerfil = 2
            };

            var result = await controller.Create(model);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var message = value!.GetType().GetProperty("message")!.GetValue(value)?.ToString();
            Assert.Equal("Perfil do usuário não encontrado.", message);
        }

        [Fact]
        public async Task Create_WithAdminRoleAndNoIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador")
            });

            var model = new UsuarioCreateDto
            {
                NomeCompleto = "Novo Usuario",
                Email = "novo@safework.com",
                Senha = "Senha123",
                IdPerfil = 2
            };

            var result = await controller.Create(model);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var message = value!.GetType().GetProperty("message")!.GetValue(value)?.ToString();
            Assert.Equal("Empresa Prestadora nao encontrada.", message);
        }

        [Fact]
        public async Task Create_WithAdminRoleAndInvalidIdEmpresaPrestadoraClaim_ReturnsUnauthorized()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "abc")
            });

            var model = new UsuarioCreateDto
            {
                NomeCompleto = "Novo Usuario",
                Email = "novo@safework.com",
                Senha = "Senha123",
                IdPerfil = 2
            };

            var result = await controller.Create(model);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(401, unauthorized.StatusCode);

            var value = unauthorized.Value;
            var message = value!.GetType().GetProperty("message")!.GetValue(value)?.ToString();
            Assert.Equal("IdEmpresaPrestadora inválido no token.", message);
        }

        [Fact]
        public async Task Create_WithAdminRoleAndValidData_CreatesUsuarioAndReturnsCreated()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador"),
                new Claim("IdEmpresaPrestadora", "3")
            });

            var model = new UsuarioCreateDto
            {
                NomeCompleto = "Novo Usuario",
                Email = "novo@safework.com",
                Senha = "Senha123",
                IdPerfil = 2
            };

            var result = await controller.Create(model);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(201, created.StatusCode);
            Assert.Equal(nameof(UsuarioController.GetById), created.ActionName);

            var dto = Assert.IsType<UsuarioDto>(created.Value);
            Assert.Equal("Novo Usuario", dto.NomeCompleto);
            Assert.Equal("novo@safework.com", dto.Email);
            Assert.Equal(2, dto.IdPerfil);
            Assert.Equal(3, dto.IdEmpresaPrestadora);

            var usuarioDb = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == "novo@safework.com");
            Assert.NotNull(usuarioDb);
            Assert.Equal(3, usuarioDb!.IdEmpresaPrestadora);
            Assert.True(!string.IsNullOrEmpty(usuarioDb.Senha));
        }

        #endregion

        #region Update

        [Fact]
        public async Task Update_WithNonExistingId_ReturnsNotFound()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador")
            });

            var model = new UsuarioUpdateDto
            {
                NomeCompleto = "Alguem",
                Email = "alguem@safework.com",
                Senha = null,
                IdPerfil = 2
            };

            var result = await controller.Update(999, model);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Update_WithExistingIdAndEmptyPassword_UpdatesDataWithoutChangingPassword()
        {
            var controller = CreateController();

            var usuario = new Usuario
            {
                NomeCompleto = "Usuario Antigo",
                Email = "antigo@safework.com",
                Senha = "hash-antigo",
                IdPerfil = 2,
                IdEmpresaPrestadora = 1
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador")
            });

            var model = new UsuarioUpdateDto
            {
                NomeCompleto = "Usuario Atualizado",
                Email = "novo@safework.com",
                Senha = null,
                IdPerfil = 3
            };

            var result = await controller.Update(usuario.Id, model);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<UsuarioDto>(ok.Value);

            Assert.Equal("Usuario Atualizado", dto.NomeCompleto);
            Assert.Equal("novo@safework.com", dto.Email);
            Assert.Equal(3, dto.IdPerfil);

            var usuarioDb = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == usuario.Id);
            Assert.NotNull(usuarioDb);
            Assert.Equal("hash-antigo", usuarioDb!.Senha);
        }

        [Fact]
        public async Task Update_WithExistingIdAndNewPassword_UpdatesHashedPassword()
        {
            var controller = CreateController();

            var usuario = new Usuario
            {
                NomeCompleto = "Usuario Antigo",
                Email = "antigo@safework.com",
                Senha = BCrypt.Net.BCrypt.HashPassword("SenhaAntiga"),
                IdPerfil = 2,
                IdEmpresaPrestadora = 1
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador")
            });

            var model = new UsuarioUpdateDto
            {
                NomeCompleto = "Usuario Antigo",
                Email = "antigo@safework.com",
                Senha = "SenhaNova",
                IdPerfil = 2
            };

            var result = await controller.Update(usuario.Id, model);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<UsuarioDto>(ok.Value);

            Assert.Equal("antigo@safework.com", dto.Email);

            var usuarioDb = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == usuario.Id);
            Assert.NotNull(usuarioDb);
            Assert.True(BCrypt.Net.BCrypt.Verify("SenhaNova", usuarioDb!.Senha));
        }

        #endregion

        #region Delete

        [Fact]
        public async Task Delete_WithNonExistingId_ReturnsNotFound()
        {
            var controller = CreateController();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador")
            });

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_WithExistingId_RemovesEntityAndReturnsNoContent()
        {
            var controller = CreateController();

            var usuario = new Usuario
            {
                NomeCompleto = "Usuario Deletado",
                Email = "delete@safework.com",
                Senha = "hash",
                IdPerfil = 2,
                IdEmpresaPrestadora = 1
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            SetUserWithClaims(controller, new[]
            {
                new Claim(ClaimTypes.Role, "Administrador")
            });

            var result = await controller.Delete(usuario.Id);

            Assert.IsType<NoContentResult>(result);

            var usuarioDb = await _context.Usuarios.FindAsync(usuario.Id);
            Assert.Null(usuarioDb);
        }

        #endregion
    }
}
