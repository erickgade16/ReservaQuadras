using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaQuadras.API.Entities;
using ReservaQuadras.API.Services;

namespace ReservaQuadras.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservasController : ControllerBase
{
    private readonly IReservaService _reservaService;

    public ReservasController(IReservaService reservaService)
    {
        _reservaService = reservaService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var reservas = await _reservaService.ListarAsync();

        return Ok(reservas);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Reserva reserva)
    {
        try
        {
            var reservaCriada =
                await _reservaService.CriarAsync(reserva);

            return Ok(reservaCriada);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(
        int id,
        Reserva reserva)
    {
        try
        {
            var reservaAtualizada =
                await _reservaService.AtualizarAsync(
                    id,
                    reserva);

            if (reservaAtualizada == null)
                return NotFound("Reserva não encontrada.");

            return Ok(reservaAtualizada);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("quadra/{quadraId}")]
    public async Task<IActionResult> GetReservasPorQuadra(
        int quadraId,
        DateTime data)
    {
        var reservas =
            await _reservaService.ListarPorQuadraAsync(
                quadraId,
                data);

        if (reservas == null)
            return NotFound("Quadra não encontrada.");

        return Ok(reservas);
    }

    [HttpGet("quadra/{quadraId}/horarios-disponiveis")]
    public async Task<IActionResult> GetHorariosDisponiveis(
        int quadraId,
        DateTime data)
    {
        try
        {
            var horarios =
                await _reservaService
                    .BuscarHorariosDisponiveisAsync(
                        quadraId,
                        data);

            if (horarios == null)
                return NotFound("Quadra não encontrada.");

            return Ok(horarios);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> AlterarStatus(
        int id,
        [FromBody] bool ativo)
    {
        var reserva =
            await _reservaService.AlterarStatusAsync(
                id,
                ativo);

        if (reserva == null)
            return NotFound("Reserva não encontrada.");

        return Ok(reserva);
    }
}