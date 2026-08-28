using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaQuadras.API.Migrations
{
    /// <inheritdoc />
    public partial class AtualizandoDuracaoDeReserva : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DuracaoReservaMinutos",
                table: "Reservas");

            migrationBuilder.AddColumn<int>(
                name: "DuracaoReservaMinutos",
                table: "Quadras",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DuracaoReservaMinutos",
                table: "Quadras");

            migrationBuilder.AddColumn<int>(
                name: "DuracaoReservaMinutos",
                table: "Reservas",
                type: "int",
                nullable: true);
        }
    }
}
