using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.DTOs;

namespace ReservaQuadras.API.Services;

// Os números do dashboard são calculados no banco: o front não precisa baixar
// todas as reservas e usuários só para contar.
public class DashboardService : IDashboardService
{
    private readonly ReservaQuadrasContext _context;

    public DashboardService(ReservaQuadrasContext context)
    {
        _context = context;
    }

    public async Task<DashboardResumo> ObterResumoAsync(DateTime agora)
    {
        var hoje = agora.Date;
        var amanha = hoje.AddDays(1);
        var inicioMes = new DateTime(hoje.Year, hoje.Month, 1);
        var fimMes = inicioMes.AddMonths(1);
        var horaAgora = agora.TimeOfDay;

        var ativas = _context.Reservas
            .AsNoTracking()
            .Where(r => r.Ativo);

        var reservasHoje = await ativas.CountAsync(r =>
            r.DataReserva >= hoje && r.DataReserva < amanha);

        // Só as reservas do mês (limitado pelo período, não pelo total do sistema)
        var doMes = await ativas
            .Where(r => r.DataReserva >= inicioMes && r.DataReserva < fimMes)
            .Select(r => new { r.QuadraId, r.HoraInicio, r.HoraFim })
            .ToListAsync();

        var quadras = await _context.Quadras
            .AsNoTracking()
            .Select(q => new { q.Id, q.Nome, q.PrecoHora, q.Ativa })
            .ToListAsync();

        var preco = quadras.ToDictionary(q => q.Id, q => q.PrecoHora);

        var receitaMes = doMes.Sum(r =>
        {
            var horas = (r.HoraFim - r.HoraInicio).TotalHours;
            preco.TryGetValue(r.QuadraId, out var valor);
            return (decimal)Math.Max(horas, 0) * valor;
        });

        var contagem = doMes
            .GroupBy(r => r.QuadraId)
            .ToDictionary(g => g.Key, g => g.Count());

        var ranking = quadras
            .Select(q => new RankingQuadra
            {
                Id = q.Id,
                Nome = q.Nome,
                Total = contagem.GetValueOrDefault(q.Id)
            })
            .OrderByDescending(q => q.Total)
            .ThenBy(q => q.Nome)
            .Take(5)
            .ToList();

        var proximas = await ativas
            .Include(r => r.Usuario)
            .Include(r => r.Quadra)
            .Where(r =>
                r.DataReserva >= amanha ||
                (r.DataReserva >= hoje &&
                 r.DataReserva < amanha &&
                 r.HoraInicio >= horaAgora))
            .OrderBy(r => r.DataReserva)
            .ThenBy(r => r.HoraInicio)
            .Take(5)
            .ToListAsync();

        return new DashboardResumo
        {
            ReservasHoje = reservasHoje,
            ReservasMes = doMes.Count,
            QuadrasAtivas = quadras.Count(q => q.Ativa),
            QuadrasTotal = quadras.Count,
            UsuariosAtivos = await _context.Usuarios
                .CountAsync(u => u.Ativo && !u.Bloqueado),
            UsuariosTotal = await _context.Usuarios.CountAsync(),
            ReceitaMes = receitaMes,
            Proximas = proximas.Select(ReservaListaItem.De).ToList(),
            Ranking = ranking
        };
    }
}
