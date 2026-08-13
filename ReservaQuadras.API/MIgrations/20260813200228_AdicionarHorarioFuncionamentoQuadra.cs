using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaQuadras.API.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarHorarioFuncionamentoQuadra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "HoraAbertura",
                table: "Quadras",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "HoraFechamento",
                table: "Quadras",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HoraAbertura",
                table: "Quadras");

            migrationBuilder.DropColumn(
                name: "HoraFechamento",
                table: "Quadras");
        }
    }
}
