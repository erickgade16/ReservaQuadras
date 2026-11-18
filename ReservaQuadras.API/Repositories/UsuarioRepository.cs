using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.DTOs;
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

    public async Task<(List<Usuario> Itens, int Total)> ListarPaginadoAsync(
        ConsultaPaginada consulta)
    {
        var query = _context.Usuarios
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(consulta.Busca))
        {
            var termo = consulta.Busca.Trim().ToLower();

            query = query.Where(u =>
                u.Nome.ToLower().Contains(termo) ||
                u.Email.ToLower().Contains(termo));
        }

        if (consulta.Ativo.HasValue)
        {
            var ativo = consulta.Ativo.Value;
            query = query.Where(u => u.Ativo == ativo);
        }

        var total = await query.CountAsync();

        var desc = consulta.Descendente;

        IOrderedQueryable<Usuario> ordenada =
            consulta.OrdenarPor?.Trim().ToLower() switch
            {
                "email" => desc
                    ? query.OrderByDescending(u => u.Email)
                    : query.OrderBy(u => u.Email),

                "datacadastro" => desc
                    ? query.OrderByDescending(u => u.DataCadastro)
                    : query.OrderBy(u => u.DataCadastro),

                "ativo" or "status" => desc
                    ? query.OrderByDescending(u => u.Ativo)
                    : query.OrderBy(u => u.Ativo),

                "nome" => desc
                    ? query.OrderByDescending(u => u.Nome)
                    : query.OrderBy(u => u.Nome),

                _ => query.OrderBy(u => u.Nome)
            };

        var itens = await ordenada
            .ThenBy(u => u.Id)
            .Skip((consulta.Pagina - 1) * consulta.Tamanho)
            .Take(consulta.Tamanho)
            .ToListAsync();

        return (itens, total);
    }

    // Usado pelo campo de busca de usuário ao reservar: só ativos e não bloqueados
    public async Task<List<Usuario>> BuscarParaSelecaoAsync(
        string? termo,
        int limite)
    {
        var query = _context.Usuarios
            .AsNoTracking()
            .Where(u => u.Ativo && !u.Bloqueado);

        if (!string.IsNullOrWhiteSpace(termo))
        {
            var t = termo.Trim().ToLower();

            query = query.Where(u =>
                u.Nome.ToLower().Contains(t) ||
                u.Email.ToLower().Contains(t));
        }

        return await query
            .OrderBy(u => u.Nome)
            .ThenBy(u => u.Id)
            .Take(limite)
            .ToListAsync();
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