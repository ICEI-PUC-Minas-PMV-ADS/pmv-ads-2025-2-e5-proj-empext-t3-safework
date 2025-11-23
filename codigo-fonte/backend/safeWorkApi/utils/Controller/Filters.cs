using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using safeWorkApi.Models;

namespace safeWorkApi.utils.Controller
{
    public class Filters : ControllerBase
    {
        private readonly AppDbContext _context;

        public Filters(AppDbContext context)
        {
            _context = context;
        }

        //Funcao que retorna uma Lista das emprsas clientes Vinculadas a empresa prestadora
        public async Task<List<int>> VerficarEmpresasClientes(int idEmpresaPrestadora)
        {
            List<int> empresasClinetes = await _context.Contratos
                .AsNoTracking()
                .Where(c => c.IdEmpresaPrestadora == idEmpresaPrestadora)
                .Select(c => c.IdEmpresaCliente)
                .Distinct()
                .ToListAsync();

            return empresasClinetes;
        }

        public async Task<ActionResult<List<Colaborador>>> FiltrarColaboradoresPorContrato(ClaimsPrincipal User)
        {
            //Perfil do usuário
            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            //Validação do Perfil
            if (string.IsNullOrEmpty(perfil))
                return Unauthorized(new { message = "Perfil do usuário não encontrado." });



            if (perfil == "Root")
            {
                // Se ROOT retorna todos os colaboradores
                var colaboradores = await _context.Colaboradores
                .AsNoTracking()
                .ToListAsync();

                return colaboradores;
            }

            //Recupera IdEmpresaPrestadora
            var idEmpresaPrestadoraString = User.FindFirst("IdEmpresaPrestadora")?.Value;

            // Somente Root pode não ter empresa prestadora
            if (string.IsNullOrEmpty(idEmpresaPrestadoraString))
                return Unauthorized(new { message = "Empresa Prestadora nao encontrada." });

            if (!int.TryParse(idEmpresaPrestadoraString, out int idEmpresaPrestadora))
                return Unauthorized(new { message = "IdEmpresaPrestadora inválido no token." });

            //Obtem o lista de Ids das empresas clientes vinculadas a empresa prestadora pelo contrato
            List<int> empresasClinetes = await VerficarEmpresasClientes(idEmpresaPrestadora);

            // Verifica se nao existe um contrato que vincule
            if (empresasClinetes.Count == 0)
                return NotFound(new { message = "Nenhum contrato encontrado para esta Empresa Prestadora." });

            //Perfis permitidos para retorno
            if (string.Equals(perfil, "Administrador")
                || string.Equals(perfil, "Colaborador"))
            {
                var colaboradoresFiltrados = await _context.Colaboradores
                .AsNoTracking()
                .Where(c => empresasClinetes.Contains(c.IdEmpresaCliente))
                .ToListAsync();

                if (colaboradoresFiltrados.Count == 0)
                    return new List<Colaborador>();

                return colaboradoresFiltrados;
            }
            else
                return Unauthorized(new { message = "Perfil do usuario nao encontrado." });
        }

        public async Task<ActionResult<List<EmpresaCliente>>> FiltrarEmpresasPorContrato(ClaimsPrincipal User)
        {
            //Perfil do usuário
            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            //Validação do Perfil
            if (string.IsNullOrEmpty(perfil))
                return Unauthorized(new { message = "Perfil do usuário não encontrado." });



            if (perfil == "Root")
            {
                // Se ROOT retorna todos os colaboradores
                var empresasClientes = await _context.EmpresasClientes
                .AsNoTracking()
                .ToListAsync();

                return empresasClientes;
            }

            //Recupera IdEmpresaPrestadora
            var idEmpresaPrestadoraString = User.FindFirst("IdEmpresaPrestadora")?.Value;

            // Somente Root pode não ter empresa prestadora
            if (string.IsNullOrEmpty(idEmpresaPrestadoraString))
                return Unauthorized(new { message = "Empresa Prestadora nao encontrada." });

            if (!int.TryParse(idEmpresaPrestadoraString, out int idEmpresaPrestadora))
                return Unauthorized(new { message = "IdEmpresaPrestadora inválido no token." });

            //Obtem o lista de Ids das empresas clientes vinculadas a empresa prestadora pelo contrato
            List<int> empresasClinetes = await VerficarEmpresasClientes(idEmpresaPrestadora);

            // Verifica se nao existe um contrato que vincule
            if (empresasClinetes.Count == 0)
                return NotFound(new { message = "Nenhum contrato encontrado para esta Empresa Prestadora." });

            //Perfis permitidos para retorno
            if (string.Equals(perfil, "Administrador")
                || string.Equals(perfil, "Colaborador"))
            {
                var emrpesasClientesFiltradas = await _context.EmpresasClientes
                .AsNoTracking()
                .Where(c => empresasClinetes.Contains(c.Id))
                .ToListAsync();

                if (emrpesasClientesFiltradas.Count == 0)
                    return new List<EmpresaCliente>();

                return emrpesasClientesFiltradas;
            }
            else
                return Unauthorized(new { message = "Perfil do usuario nao encontrado." });
        }

        public async Task<ActionResult<List<Usuario>>> FiltrarUsuarioPorContrato(ClaimsPrincipal User)
        {
            //Perfil do usuário
            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            //Validação do Perfil
            if (string.IsNullOrEmpty(perfil))
                return Unauthorized(new { message = "Perfil do usuário não encontrado." });

            if (perfil == "Root")
            {
                // Se ROOT retorna todos os colaboradores
                var usuarios = await _context.Usuarios
                .AsNoTracking()
                .ToListAsync();

                return usuarios;
            }

            //Recupera IdEmpresaPrestadora
            var idEmpresaPrestadoraString = User.FindFirst("IdEmpresaPrestadora")?.Value;

            // Somente Root pode não ter empresa prestadora
            if (string.IsNullOrEmpty(idEmpresaPrestadoraString))
                return Unauthorized(new { message = "Empresa Prestadora nao encontrada." });

            if (!int.TryParse(idEmpresaPrestadoraString, out int idEmpresaPrestadora))
                return Unauthorized(new { message = "IdEmpresaPrestadora inválido no token." });

            //Perfis permitidos para retorno
            if (string.Equals(perfil, "Administrador")
                || string.Equals(perfil, "Colaborador"))
            {
                var usuariosFiltrados = await _context.Usuarios
                .AsNoTracking()
                .Where(c => c.IdEmpresaPrestadora == idEmpresaPrestadora)
                .ToListAsync();

                if (usuariosFiltrados.Count == 0)
                    return new List<Usuario>();

                return usuariosFiltrados;
            }
            else
                return Unauthorized(new { message = "Perfil do usuario nao encontrado." });
        }
    }
}