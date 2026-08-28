using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly ReservaQuadrasContext _context;

    public UsuarioRepository(ReservaQuadrasContext context)
    {
        _context = context;
    }

    public async Task<List<Usuario>> ListarAsync()
    {
        return await _context.Usuarios.ToListAsync();
    }

    public async Task<Usuario?> BuscarPorIdAsync(int id)
    {
        return await _context.Usuarios.FindAsync(id);
    }

    public async Task<Usuario> CriarAsync(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);

        await _context.SaveChangesAsync();

        return usuario;
    }

    public async Task AtualizarAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<bool> EmailExisteAsync(
        string email,
        int? usuarioId = null)
    {
        var emailNormalizado = email.Trim().ToLower();

        return await _context.Usuarios
            .AnyAsync(u =>
                u.Email.ToLower() == emailNormalizado &&
                (!usuarioId.HasValue || u.Id != usuarioId.Value));
    }

    public async Task<Usuario?> BuscarPorEmailAsync(string email)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == email);
    }
}