using Microsoft.EntityFrameworkCore;
using safeWorkApi.Dominio.DTOs;


namespace safeWorkApi.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        //Configuracoes de utilizacao da ORM (Relacionamentos e dados iniciais)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //Implementa os dados iniciais do Perfil
            modelBuilder.Entity<Perfil>().HasData(
                new Perfil { Id = 1, NomePerfil = "Root" },
                new Perfil { Id = 2, NomePerfil = "Administrador" },
                new Perfil { Id = 3, NomePerfil = "Colaborador" }
            );

            //Implementa os dados iniciais da EmpresaPrestadora
            modelBuilder.Entity<EmpresaPrestadora>().HasData(
                new EmpresaPrestadora
                {
                    Id = 1,
                    TipoPessoa = TipoPessoa.Juridica,
                    CpfCnpj = "99999999000199",
                    NomeRazao = "ScPrevenção",
                    Status = true
                }
            );

            //Configuracoes dos relacionamentos entre entidades
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Perfil)
                .WithMany(p => p.Usuario)
                .HasForeignKey(u => u.IdPerfil);

            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.EmpresaPrestadora)
                .WithMany(ep => ep.Usuarios)
                .HasForeignKey(u => u.IdEmpresaPrestadora);

            modelBuilder.Entity<Colaborador>()
                .HasOne(c => c.Endereco)
                .WithMany(ec => ec.Colaborador)
                .HasForeignKey(c => c.IdEmpresaCliente);

            modelBuilder.Entity<Colaborador>()
                .HasOne(c => c.EmpresaCliente)
                .WithMany(co => co.Colaboradores)
                .HasForeignKey(c => c.IdEmpresaCliente);

            modelBuilder.Entity<Aso>()
                .HasOne(a => a.Colaborador)
                .WithMany(c => c.Asos)
                .HasForeignKey(a => a.IdColaborador);

            modelBuilder.Entity<EmpresaCliente>()
                .HasOne(ec => ec.Endereco)
                .WithMany(e => e.EmpresaCliente)
                .HasForeignKey(ec => ec.IdEndereco);

            modelBuilder.Entity<EmpresaCliente>()
                .Property(e => e.TipoPessoa)
                .HasConversion<string>();

            modelBuilder.Entity<EmpresaPrestadora>()
                .HasOne(ep => ep.Endereco)
                .WithMany(e => e.EmpresaPrestadora)
                .HasForeignKey(ep => ep.IdEndereco);

            modelBuilder.Entity<Contrato>()
                .HasOne(c => c.EmpresaCliente)
                .WithMany(ec => ec.Contratos)
                .HasForeignKey(c => c.IdEmpresaCliente);

            modelBuilder.Entity<Contrato>()
                .HasOne(c => c.EmpresaPrestadora)
                .WithMany(ep => ep.Contratos)
                .HasForeignKey(c => c.IdEmpresaPrestadora);

        }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Perfil> Perfis { get; set; }
        public DbSet<EmpresaPrestadora> EmpresasPrestadoras { get; set; }
        public DbSet<EmpresaCliente> EmpresasClientes { get; set; }
        public DbSet<Colaborador> Colaboradores { get; set; }
        public DbSet<Endereco> Enderecos { get; set; }
        public DbSet<Aso> Asos { get; set; }

    }


}