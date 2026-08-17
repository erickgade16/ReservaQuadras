using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaQuadras.API.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarAtivoReserva : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Reservas");

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Reservas",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Reservas");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Reservas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
