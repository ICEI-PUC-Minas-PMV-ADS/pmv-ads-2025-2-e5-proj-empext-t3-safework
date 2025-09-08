using Microsoft.EntityFrameworkCore;


namespace safeWorkApi.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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