using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace safeWorkApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIdEnderecoOnColaborador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_colaboradores_enderecos_id_empresa_cliente",
                table: "colaboradores");

            migrationBuilder.CreateIndex(
                name: "IX_colaboradores_id_endereco",
                table: "colaboradores",
                column: "id_endereco");

            migrationBuilder.AddForeignKey(
                name: "FK_colaboradores_enderecos_id_endereco",
                table: "colaboradores",
                column: "id_endereco",
                principalTable: "enderecos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_colaboradores_enderecos_id_endereco",
                table: "colaboradores");

            migrationBuilder.DropIndex(
                name: "IX_colaboradores_id_endereco",
                table: "colaboradores");

            migrationBuilder.AddForeignKey(
                name: "FK_colaboradores_enderecos_id_empresa_cliente",
                table: "colaboradores",
                column: "id_empresa_cliente",
                principalTable: "enderecos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
