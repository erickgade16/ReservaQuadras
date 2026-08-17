using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservasController : ControllerBase
{
    private readonly ReservaQuadrasContext _context;

    public ReservasController(ReservaQuadrasContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var reservas = await _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Quadra)
            .ToListAsync();

        return Ok(reservas);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Reserva reserva)
    {
        var usuario = await _context.Usuarios
            .FindAsync(reserva.UsuarioId);

        if (usuario == null)
            return BadRequest("Usuário não encontrado.");

        var quadra = await _context.Quadras
            .FindAsync(reserva.QuadraId);

        if (quadra == null)
            return BadRequest("Quadra não encontrada.");

        if (!quadra.Ativa)
            return BadRequest("A quadra está inativa.");

        var conflito = await _context.Reservas
       .AnyAsync(r =>
           r.QuadraId == reserva.QuadraId &&
           r.DataReserva == reserva.DataReserva &&
           r.Ativo == true &&
           reserva.HoraInicio < r.HoraFim &&
           reserva.HoraFim > r.HoraInicio);

        if (conflito)
        {
            return BadRequest("A quadra já está reservada nesse horário.");
        }

        _context.Reservas.Add(reserva);

        await _context.SaveChangesAsync();

        return Ok(reserva);
    }

    [HttpPut("{Id}")]
    public async Task<IActionResult> Put(int Id, Reserva reserva)
    {
        var usuario = await _context.Usuarios
            .FindAsync(reserva.UsuarioId);

        if (usuario == null)
            return BadRequest("Usuário não encontrado.");

        var quadra = await _context.Quadras
            .FindAsync(reserva.QuadraId);

        if (quadra == null)
            return BadRequest("Quadra não encontrada.");

        if (!quadra.Ativa)
            return BadRequest("A quadra está inativa.");

        var conflito = await _context.Reservas
    .AnyAsync(r =>
        r.Id != Id &&
        r.QuadraId == reserva.QuadraId &&
        r.DataReserva == reserva.DataReserva &&
        r.Ativo == true &&
        reserva.HoraInicio < r.HoraFim &&
        reserva.HoraFim > r.HoraInicio);

        if (conflito)
        {
            return BadRequest("A quadra já está reservada nesse horário.");
        }

        _context.Reservas.Update(reserva);

        await _context.SaveChangesAsync();

        return Ok(reserva);
    }

    [HttpGet("quadra/{quadraId}")]
    public async Task<IActionResult> GetReservasPorQuadra(
    int quadraId,
    DateTime data)
    {
        var quadra = await _context.Quadras
            .FindAsync(quadraId);

        if (quadra == null)
            return NotFound("Quadra não encontrada.");

        var reservas = await _context.Reservas
            .Where(r =>
                r.QuadraId == quadraId &&
                r.DataReserva.Date == data.Date &&
                r.Ativo == true)
            .OrderBy(r => r.HoraInicio)
            .ToListAsync();

        return Ok(reservas);
    }


    [HttpGet("quadra/{quadraId}/horarios-disponiveis")]
    public async Task<IActionResult> GetHorariosDisponiveis(
    int quadraId,
    DateTime data)
    {
        var quadra = await _context.Quadras
            .FindAsync(quadraId);

        if (quadra == null)
            return NotFound("Quadra não encontrada.");

        if (!quadra.Ativa)
            return BadRequest("A quadra está inativa.");

        var reservas = await _context.Reservas
            .Where(r =>
                r.QuadraId == quadraId &&
                r.DataReserva.Date == data.Date &&
                r.Ativo == true)
            .ToListAsync();

        var horariosDisponiveis = new List<object>();

        for (
            var inicio = quadra.HoraAbertura;
            inicio < quadra.HoraFechamento;
            inicio = inicio.Add(TimeSpan.FromHours(1)))
        {
            var fim = inicio.Add(TimeSpan.FromHours(1));

            if (fim > quadra.HoraFechamento)
                break;

            var ocupado = reservas.Any(r =>
                inicio < r.HoraFim &&
                fim > r.HoraInicio);

            horariosDisponiveis.Add(new
            {
                horaInicio = inicio,
                horaFim = fim,
                disponivel = !ocupado
            });
        }

        return Ok(horariosDisponiveis);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> AlterarStatus(
     int id,
     [FromBody] bool ativo)
    {
        var reserva = await _context.Reservas.FindAsync(id);

        if (reserva == null)
            return NotFound("Reserva não encontrada.");

        reserva.Ativo = ativo;

        await _context.SaveChangesAsync();

        return Ok(reserva);
    }
}