using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace safeWorkApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "enderecos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    logradouro = table.Column<string>(type: "text", nullable: false),
                    numero = table.Column<string>(type: "text", nullable: false),
                    complemento = table.Column<string>(type: "text", nullable: false),
                    bairro = table.Column<string>(type: "text", nullable: false),
                    municipio = table.Column<string>(type: "text", nullable: false),
                    uf = table.Column<string>(type: "text", nullable: false),
                    cep = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enderecos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Perfis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome_perfil = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Perfis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmpresasClientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo_pessoa = table.Column<int>(type: "integer", nullable: false),
                    cpf_cnpj = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    nome_razao = table.Column<string>(type: "text", nullable: false),
                    nome_fantasia = table.Column<string>(type: "text", nullable: true),
                    telefone = table.Column<string>(type: "text", nullable: true),
                    celular = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<bool>(type: "boolean", nullable: false),
                    id_endereco = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmpresasClientes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmpresasClientes_enderecos_id_endereco",
                        column: x => x.id_endereco,
                        principalTable: "enderecos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EmpresasPrestadoras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo_pessoa = table.Column<int>(type: "integer", nullable: false),
                    cpf_cnpj = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    nome_razao = table.Column<string>(type: "text", nullable: false),
                    nome_fantasia = table.Column<string>(type: "text", nullable: true),
                    telefone = table.Column<string>(type: "text", nullable: true),
                    celular = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<bool>(type: "boolean", nullable: false),
                    id_endereco = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmpresasPrestadoras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmpresasPrestadoras_enderecos_id_endereco",
                        column: x => x.id_endereco,
                        principalTable: "enderecos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "colaboradores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    funcao = table.Column<string>(type: "text", nullable: false),
                    id_empresa_cliente = table.Column<int>(type: "integer", nullable: false),
                    tipo_pessoa = table.Column<int>(type: "integer", nullable: false),
                    cpf_cnpj = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    nome_razao = table.Column<string>(type: "text", nullable: false),
                    nome_fantasia = table.Column<string>(type: "text", nullable: true),
                    telefone = table.Column<string>(type: "text", nullable: true),
                    celular = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<bool>(type: "boolean", nullable: false),
                    id_endereco = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_colaboradores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_colaboradores_EmpresasClientes_id_empresa_cliente",
                        column: x => x.id_empresa_cliente,
                        principalTable: "EmpresasClientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_colaboradores_enderecos_id_empresa_cliente",
                        column: x => x.id_empresa_cliente,
                        principalTable: "enderecos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "contratos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    numero = table.Column<string>(type: "text", nullable: false),
                    data_inicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_fim = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status_contrato = table.Column<int>(type: "integer", nullable: false),
                    path_file = table.Column<string>(type: "text", nullable: true),
                    valor = table.Column<decimal>(type: "numeric", nullable: false),
                    observacoes = table.Column<string>(type: "text", nullable: true),
                    id_empresa_cliente = table.Column<int>(type: "integer", nullable: false),
                    id_empresa_prestadora = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contratos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_contratos_EmpresasClientes_id_empresa_cliente",
                        column: x => x.id_empresa_cliente,
                        principalTable: "EmpresasClientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_contratos_EmpresasPrestadoras_id_empresa_prestadora",
                        column: x => x.id_empresa_prestadora,
                        principalTable: "EmpresasPrestadoras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome_completo = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: false),
                    senha = table.Column<string>(type: "text", nullable: false),
                    id_empresa_prestadora = table.Column<int>(type: "integer", nullable: true),
                    id_perfil = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_usuarios_EmpresasPrestadoras_id_empresa_prestadora",
                        column: x => x.id_empresa_prestadora,
                        principalTable: "EmpresasPrestadoras",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_usuarios_Perfis_id_perfil",
                        column: x => x.id_perfil,
                        principalTable: "Perfis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "asos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo_aso = table.Column<int>(type: "integer", nullable: false),
                    data_solicitacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_validade = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    path_file = table.Column<string>(type: "text", nullable: true),
                    observacoes = table.Column<string>(type: "text", nullable: true),
                    id_colaborador = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_asos_colaboradores_id_colaborador",
                        column: x => x.id_colaborador,
                        principalTable: "colaboradores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "EmpresasPrestadoras",
                columns: new[] { "Id", "celular", "cpf_cnpj", "email", "id_endereco", "nome_fantasia", "nome_razao", "status", "telefone", "tipo_pessoa" },
                values: new object[] { 1, null, "99999999000199", null, null, null, "ScPrevenção", true, null, 2 });

            migrationBuilder.InsertData(
                table: "Perfis",
                columns: new[] { "Id", "nome_perfil" },
                values: new object[,]
                {
                    { 1, "Root" },
                    { 2, "Administrador" },
                    { 3, "Colaborador" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_asos_id_colaborador",
                table: "asos",
                column: "id_colaborador");

            migrationBuilder.CreateIndex(
                name: "IX_colaboradores_id_empresa_cliente",
                table: "colaboradores",
                column: "id_empresa_cliente");

            migrationBuilder.CreateIndex(
                name: "IX_contratos_id_empresa_cliente",
                table: "contratos",
                column: "id_empresa_cliente");

            migrationBuilder.CreateIndex(
                name: "IX_contratos_id_empresa_prestadora",
                table: "contratos",
                column: "id_empresa_prestadora");

            migrationBuilder.CreateIndex(
                name: "IX_EmpresasClientes_id_endereco",
                table: "EmpresasClientes",
                column: "id_endereco");

            migrationBuilder.CreateIndex(
                name: "IX_EmpresasPrestadoras_id_endereco",
                table: "EmpresasPrestadoras",
                column: "id_endereco");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_email",
                table: "usuarios",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_id_empresa_prestadora",
                table: "usuarios",
                column: "id_empresa_prestadora");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_id_perfil",
                table: "usuarios",
                column: "id_perfil");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "asos");

            migrationBuilder.DropTable(
                name: "contratos");

            migrationBuilder.DropTable(
                name: "usuarios");

            migrationBuilder.DropTable(
                name: "colaboradores");

            migrationBuilder.DropTable(
                name: "EmpresasPrestadoras");

            migrationBuilder.DropTable(
                name: "Perfis");

            migrationBuilder.DropTable(
                name: "EmpresasClientes");

            migrationBuilder.DropTable(
                name: "enderecos");
        }
    }
}
