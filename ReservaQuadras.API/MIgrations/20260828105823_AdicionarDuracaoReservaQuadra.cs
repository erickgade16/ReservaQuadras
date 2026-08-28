using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaQuadras.API.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDuracaoReservaQuadra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DuracaoReservaMinutos",
                table: "Reservas",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DuracaoReservaMinutos",
                table: "Reservas");
        }
    }
}
