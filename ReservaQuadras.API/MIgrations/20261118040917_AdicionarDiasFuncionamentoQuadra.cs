using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaQuadras.API.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDiasFuncionamentoQuadra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DiasFuncionamento",
                table: "Quadras",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "0,1,2,3,4,5,6");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiasFuncionamento",
                table: "Quadras");
        }
    }
}
