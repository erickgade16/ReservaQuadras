using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Repositories;

public class ReservaRepository : IReservaRepository
{
    private readonly ReservaQuadrasContext _context;

    public ReservaRepository(ReservaQuadrasContext context)
    {
        _context = context;
    }

    public async Task<List<Reserva>> ListarAsync()
    {
        return await _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Quadra)
            .ToListAsync();
    }

    public async Task<Reserva?> BuscarPorIdAsync(int id)
    {
        return await _context.Reservas
            .FindAsync(id);
    }

    public async Task<List<Reserva>> BuscarPorQuadraEDataAsync(
        int quadraId,
        DateTime data)
    {
        return await _context.Reservas
            .Where(r =>
                r.QuadraId == quadraId &&
                r.DataReserva.Date == data.Date &&
                r.Ativo)
            .OrderBy(r => r.HoraInicio)
            .ToListAsync();
    }

    public async Task<bool> ExisteConflitoAsync(
        Reserva reserva)
    {
        return await _context.Reservas
            .AnyAsync(r =>
                r.Id != reserva.Id &&
                r.QuadraId == reserva.QuadraId &&
                r.DataReserva.Date == reserva.DataReserva.Date &&
                r.Ativo &&
                reserva.HoraInicio < r.HoraFim &&
                reserva.HoraFim > r.HoraInicio
            );
    }

    public async Task<Reserva> CriarAsync(Reserva reserva)
    {
        _context.Reservas.Add(reserva);

        await _context.SaveChangesAsync();

        return reserva;
    }

    public async Task AtualizarAsync()
    {
        await _context.SaveChangesAsync();
    }
}