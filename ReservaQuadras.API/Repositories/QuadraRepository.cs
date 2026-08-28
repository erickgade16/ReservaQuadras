using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Repositories;

public class QuadraRepository : IQuadraRepository
{
    private readonly ReservaQuadrasContext _context;

    public QuadraRepository(ReservaQuadrasContext context)
    {
        _context = context;
    }

    public async Task<List<Quadra>> ListarAsync()
    {
        return await _context.Quadras.ToListAsync();
    }

    public async Task<Quadra?> BuscarPorIdAsync(int id)
    {
        return await _context.Quadras.FindAsync(id);
    }

    public async Task<Quadra> CriarAsync(Quadra quadra)
    {
        _context.Quadras.Add(quadra);

        await _context.SaveChangesAsync();

        return quadra;
    }

    public async Task AtualizarAsync()
    {
        await _context.SaveChangesAsync();
    }
}