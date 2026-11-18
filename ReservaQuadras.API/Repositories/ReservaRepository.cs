using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.DTOs;
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

    public async Task<(List<Reserva> Itens, int Total)> ListarPaginadoAsync(
        ConsultaReservas consulta)
    {
        var query = _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Quadra)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(consulta.Busca))
        {
            var termo = consulta.Busca.Trim().ToLower();

            query = query.Where(r =>
                r.Usuario!.Nome.ToLower().Contains(termo) ||
                r.Usuario!.Email.ToLower().Contains(termo) ||
                r.Quadra!.Nome.ToLower().Contains(termo));
        }

        if (consulta.Ativo.HasValue)
        {
            var ativo = consulta.Ativo.Value;
            query = query.Where(r => r.Ativo == ativo);
        }

        if (consulta.QuadraId.HasValue)
        {
            var quadraId = consulta.QuadraId.Value;
            query = query.Where(r => r.QuadraId == quadraId);
        }

        if (consulta.Data.HasValue)
        {
            var inicio = consulta.Data.Value.Date;
            var fim = inicio.AddDays(1);

            query = query.Where(r =>
                r.DataReserva >= inicio &&
                r.DataReserva < fim);
        }

        var total = await query.CountAsync();

        var itens = await Ordenar(query, consulta)
            .Skip((consulta.Pagina - 1) * consulta.Tamanho)
            .Take(consulta.Tamanho)
            .ToListAsync();

        return (itens, total);
    }

    public async Task<List<Reserva>> ListarPorDataAsync(DateTime data)
    {
        var inicio = data.Date;
        var fim = inicio.AddDays(1);

        return await _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Quadra)
            .Where(r =>
                r.Ativo &&
                r.DataReserva >= inicio &&
                r.DataReserva < fim)
            .OrderBy(r => r.HoraInicio)
            .ToListAsync();
    }

    // Só aceita campos conhecidos: nunca monta ordenação a partir de texto livre
    private static IOrderedQueryable<Reserva> Ordenar(
        IQueryable<Reserva> query,
        ConsultaPaginada consulta)
    {
        var desc = consulta.Descendente;

        IOrderedQueryable<Reserva> ordenada =
            consulta.OrdenarPor?.Trim().ToLower() switch
            {
                "horainicio" => desc
                    ? query.OrderByDescending(r => r.HoraInicio)
                    : query.OrderBy(r => r.HoraInicio),

                "usuario.nome" => desc
                    ? query.OrderByDescending(r => r.Usuario!.Nome)
                    : query.OrderBy(r => r.Usuario!.Nome),

                "quadra.nome" => desc
                    ? query.OrderByDescending(r => r.Quadra!.Nome)
                    : query.OrderBy(r => r.Quadra!.Nome),

                "ativo" or "status" => desc
                    ? query.OrderByDescending(r => r.Ativo)
                    : query.OrderBy(r => r.Ativo),

                "datareserva" => desc
                    ? query.OrderByDescending(r => r.DataReserva)
                        .ThenByDescending(r => r.HoraInicio)
                    : query.OrderBy(r => r.DataReserva)
                        .ThenBy(r => r.HoraInicio),

                // Padrão: reservas mais recentes primeiro
                _ => query.OrderByDescending(r => r.DataReserva)
                    .ThenByDescending(r => r.HoraInicio)
            };

        // Desempate estável para a paginação não repetir nem pular itens
        return ordenada.ThenBy(r => r.Id);
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