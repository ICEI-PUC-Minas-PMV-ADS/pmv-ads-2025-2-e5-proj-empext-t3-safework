using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace safeWorkApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "perfis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome_perfil = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perfis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "empresa_cliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo_pessoa = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_empresa_cliente", x => x.Id);
                    table.ForeignKey(
                        name: "FK_empresa_cliente_enderecos_id_endereco",
                        column: x => x.id_endereco,
                        principalTable: "enderecos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "empresa_prestadora",
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
                    table.PrimaryKey("PK_empresa_prestadora", x => x.Id);
                    table.ForeignKey(
                        name: "FK_empresa_prestadora_enderecos_id_endereco",
                        column: x => x.id_endereco,
                        principalTable: "enderecos",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "empresa_prestadora",
                columns: new[] { "Id", "celular", "cpf_cnpj", "email", "id_endereco", "nome_fantasia", "nome_razao", "status", "telefone", "tipo_pessoa" },
                values: new object[] { 1, null, "99999999000199", null, null, null, "ScPrevenção", true, null, 1 });

            migrationBuilder.InsertData(
                table: "perfis",
                columns: new[] { "Id", "nome_perfil" },
                values: new object[,]
                {
                    { 1, "Root" },
                    { 2, "Administrador" },
                    { 3, "Colaborador" }
                });


            migrationBuilder.CreateIndex(
                name: "IX_empresa_cliente_id_endereco",
                table: "empresa_cliente",
                column: "id_endereco");

            migrationBuilder.CreateIndex(
                name: "IX_empresa_prestadora_id_endereco",
                table: "empresa_prestadora",
                column: "id_endereco");
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
                name: "empresa_prestadora");

            migrationBuilder.DropTable(
                name: "perfis");

            migrationBuilder.DropTable(
                name: "empresa_cliente");

            migrationBuilder.DropTable(
                name: "enderecos");
        }
    }
}
